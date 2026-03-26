const API_BASE = window.location.protocol === "file:" ? "http://localhost:3000/api" : "/api";

const toggleBtns = document.querySelectorAll(".toggle-btn");
const selectedText = document.getElementById("selected-text");
const formSubtitle = document.getElementById("form-subtitle");
const prioritySel = document.getElementById("prioritate");
const form = document.getElementById("sesizari-form");
const latInput = document.getElementById("lat");
const lngInput = document.getElementById("lng");
const locationInfo = document.getElementById("location-info");
const locationText = document.getElementById("location-text");
const locationPlaceholder = document.getElementById("location-placeholder");
const locationClearButton = document.getElementById("location-clear");
const resetButton = document.getElementById("btn-reset");
const mapFilters = document.getElementById("map-filters");
const btnHideAll = document.getElementById("btn-hide-all");

function setTip(tip) {
  toggleBtns.forEach((button) => {
    button.classList.toggle("active", button.dataset.tip === tip);
  });

  if (tip === "urgenta") {
    selectedText.textContent = "Sesizare urgenta";
    formSubtitle.textContent = "Sesizarile urgente sunt prioritizate si procesate primele.";
    prioritySel.selectedIndex = 0;
    return;
  }

  selectedText.textContent = "Sesizare obisnuita";
  formSubtitle.textContent = "Sesizarile obisnuite sunt procesate in ordinea primirii.";
  prioritySel.selectedIndex = 2;
}

toggleBtns.forEach((button) => {
  button.addEventListener("click", () => setTip(button.dataset.tip));
});

const GALATI = [45.4353, 28.0507];
const GALATI_BOUNDS = L.latLngBounds(L.latLng(45.38, 27.93), L.latLng(45.5, 28.15));

const map = L.map("map", {
  center: GALATI,
  zoom: 14,
  minZoom: 12,
  maxZoom: 19,
  maxBounds: GALATI_BOUNDS,
  maxBoundsViscosity: 1,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
}).addTo(map);

setTimeout(() => map.invalidateSize(), 100);

const markerIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 10.76 14.24 23.28 15.25 24.19a1 1 0 0 0 1.5 0C17.76 39.28 32 26.76 32 16 32 7.16 24.84 0 16 0z" fill="#e53e3e"/>
    <circle cx="16" cy="16" r="6" fill="#fff"/>
  </svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -42],
});

const CAT_COLORS = {
  "Infrastructura deteriorata": "#f97316",
  "Iluminat stradal": "#eab308",
  "Gunoi / Salubritate": "#22c55e",
  "Spatii verzi": "#10b981",
  "Transport public": "#3b82f6",
  "Siguranta rutiera": "#e53e3e",
  Altele: "#94a3b8",
};

let marker = null;
let lastLatLng = null;
let existingMarkers = [];
let allHidden = false;
let toastTimer = null;
const activeFilters = new Set(["toate"]);

function showToast(message) {
  let toast = document.getElementById("map-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "map-toast";
    document.getElementById("map").parentElement.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
}

function updateLocation(latlng) {
  const lat = latlng.lat.toFixed(5);
  const lng = latlng.lng.toFixed(5);

  latInput.value = lat;
  lngInput.value = lng;

  if (locationText) {
    locationText.textContent = `${lat}, ${lng}`;
  }
  if (locationInfo) {
    locationInfo.hidden = false;
  }
  if (locationPlaceholder) {
    locationPlaceholder.hidden = true;
  }
}

function clearMarker() {
  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }

  lastLatLng = null;
  latInput.value = "";
  lngInput.value = "";

  if (locationInfo) {
    locationInfo.hidden = true;
  }
  if (locationPlaceholder) {
    locationPlaceholder.hidden = false;
  }
}

function setMarker(latlng) {
  if (!GALATI_BOUNDS.contains(latlng)) {
    showToast("Poti marca doar locatii din orasul Galati.");
    return;
  }

  if (marker) {
    marker.setLatLng(latlng);
  } else {
    marker = L.marker(latlng, { icon: markerIcon, draggable: true }).addTo(map);
    marker.on("dragstart", () => {
      lastLatLng = marker.getLatLng();
    });
    marker.on("dragend", () => {
      const currentPosition = marker.getLatLng();
      if (!GALATI_BOUNDS.contains(currentPosition)) {
        marker.setLatLng(lastLatLng);
        showToast("Poti marca doar locatii din orasul Galati.");
        if (lastLatLng) {
          updateLocation(lastLatLng);
        }
        return;
      }

      lastLatLng = currentPosition;
      updateLocation(currentPosition);
    });
  }

  lastLatLng = latlng;
  updateLocation(latlng);
}

function makeExistingIcon(color) {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 32 40">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10.76 14.24 23.28 15.25 24.19a1 1 0 0 0 1.5 0C17.76 39.28 32 26.76 32 16 32 7.16 24.84 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="6" fill="#fff"/>
    </svg>`,
    iconSize: [24, 30],
    iconAnchor: [12, 30],
    popupAnchor: [0, -32],
  });
}

function normalizeCategory(category) {
  const value = String(category || "Altele").trim();
  if (value === "Infrastructură deteriorată") return "Infrastructura deteriorata";
  if (value === "Spații verzi") return "Spatii verzi";
  if (value === "Siguranță rutieră") return "Siguranta rutiera";
  return value;
}

function normalizeSesizare(sesizare) {
  const autorVechi = [sesizare.prenume, sesizare.nume].filter(Boolean).join(" ");

  return {
    titlu: sesizare.titlu || sesizare.sesizare || "(fara titlu)",
    categorie: normalizeCategory(sesizare.categorie || sesizare.criteriuSesizare || "Altele"),
    autor: sesizare.autor || autorVechi || "Anonim",
    lat: sesizare.lat || null,
    lng: sesizare.lng || null,
  };
}

function applyFilters() {
  existingMarkers.forEach((existingMarker) => {
    const categoryMatch =
      activeFilters.has("toate") || activeFilters.has(existingMarker.sesizareCategorie);

    if (!allHidden && categoryMatch) {
      if (!map.hasLayer(existingMarker)) {
        existingMarker.addTo(map);
      }
      return;
    }

    if (map.hasLayer(existingMarker)) {
      map.removeLayer(existingMarker);
    }
  });
}

async function loadExistingMarkers() {
  try {
    const response = await fetch(`${API_BASE}/reports`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    existingMarkers.forEach((existingMarker) => {
      map.removeLayer(existingMarker);
    });
    existingMarkers = [];

    data.forEach((item) => {
      const sesizare = normalizeSesizare(item);
      if (!sesizare.lat || !sesizare.lng) {
        return;
      }

      const color = CAT_COLORS[sesizare.categorie] || CAT_COLORS.Altele;
      const existingMarker = L.marker([sesizare.lat, sesizare.lng], {
        icon: makeExistingIcon(color),
      });

      existingMarker.sesizareCategorie = sesizare.categorie;
      existingMarker.bindPopup(
        `<strong>${sesizare.titlu}</strong><br><span style="font-size:.85em;color:#64748b">${sesizare.categorie}</span><br><span style="font-size:.78em;color:#94a3b8">de ${sesizare.autor}</span>`,
      );

      existingMarker.addTo(map);
      existingMarkers.push(existingMarker);
    });

    applyFilters();
  } catch (error) {
    console.warn("[Harta] Eroare la incarcarea sesizarilor:", error.message);
  }
}

map.on("click", (event) => setMarker(event.latlng));

if (locationClearButton) {
  locationClearButton.addEventListener("click", clearMarker);
}

if (mapFilters) {
  mapFilters.addEventListener("click", (event) => {
    const chip = event.target.closest(".filter-chip");
    if (!chip) {
      return;
    }

    const category = chip.dataset.cat;
    if (category === "toate") {
      activeFilters.clear();
      activeFilters.add("toate");
      document.querySelectorAll(".filter-chip").forEach((filterChip) => {
        filterChip.classList.toggle("active", filterChip.dataset.cat === "toate");
      });
    } else {
      activeFilters.delete("toate");
      document
        .querySelector('.filter-chip[data-cat="toate"]')
        ?.classList.remove("active");

      if (activeFilters.has(category)) {
        activeFilters.delete(category);
        chip.classList.remove("active");

        if (activeFilters.size === 0) {
          activeFilters.add("toate");
          document
            .querySelector('.filter-chip[data-cat="toate"]')
            ?.classList.add("active");
        }
      } else {
        activeFilters.add(category);
        chip.classList.add("active");
      }
    }

    allHidden = false;
    if (btnHideAll) {
      btnHideAll.textContent = "Ascunde tot";
      btnHideAll.classList.remove("hidden-state");
    }

    applyFilters();
  });
}

if (btnHideAll) {
  btnHideAll.addEventListener("click", () => {
    allHidden = !allHidden;
    btnHideAll.textContent = allHidden ? "Arata tot" : "Ascunde tot";
    btnHideAll.classList.toggle("hidden-state", allHidden);
    applyFilters();
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    clearMarker();
    setTip("urgenta");
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!latInput.value || !lngInput.value) {
    alert("Te rugam sa marchezi locatia pe harta.");
    return;
  }

  const userStored = localStorage.getItem("user");
  const parsedUser = userStored ? JSON.parse(userStored) : null;
  const payload = {
    autor: parsedUser?.nume || "Anonim",
    tip: document.querySelector(".toggle-btn.active")?.dataset.tip || "urgenta",
    categorie: document.getElementById("categorie").value,
    prioritate: document.getElementById("prioritate").value,
    titlu: document.getElementById("titlu").value.trim(),
    descriere: document.getElementById("descriere").value.trim(),
    lat: Number.parseFloat(latInput.value),
    lng: Number.parseFloat(lngInput.value),
  };

  try {
    const response = await fetch(`${API_BASE}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.succes) {
      throw new Error(data.mesaj || "Trimiterea sesizarii a esuat.");
    }

    alert("Sesizarea a fost trimisa cu succes!");
    form.reset();
    clearMarker();
    setTip("urgenta");
    await loadExistingMarkers();
  } catch (error) {
    console.error(error);
    alert(`Eroare la trimitere: ${error.message}`);
  }
});

setTip("urgenta");
loadExistingMarkers();
