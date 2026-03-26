// ── TOGGLE ──────────────────────────────────────────────
const toggleBtns   = document.querySelectorAll('.toggle-btn');
const selectedText = document.getElementById('selected-text');
const formSubtitle = document.getElementById('form-subtitle');
const prioritySel  = document.getElementById('prioritate');

function setTip(tip) {
    toggleBtns.forEach(b => b.classList.toggle('active', b.dataset.tip === tip));

    if (tip === 'urgenta') {
        selectedText.textContent  = 'Sesizare urgentă';
        formSubtitle.textContent  = 'Sesizările urgente sunt prioritizate și procesate primul.';
        prioritySel.selectedIndex = 0;
    } else {
        selectedText.textContent  = 'Sesizare obișnuită';
        formSubtitle.textContent  = 'Sesizările obișnuite sunt procesate în ordinea primirii.';
        prioritySel.selectedIndex = 2;
    }
}

toggleBtns.forEach(b => b.addEventListener('click', () => setTip(b.dataset.tip)));

// ── MAP ─────────────────────────────────────────────────
const GALATI        = [45.4353, 28.0507];
const GALATI_BOUNDS = L.latLngBounds(
    L.latLng(45.38, 27.93),   // sud-vest
    L.latLng(45.50, 28.15)    // nord-est
);

const map = L.map('map', {
    center:     GALATI,
    zoom:       14,
    minZoom:    12,
    maxZoom:    19,
    maxBounds:  GALATI_BOUNDS,
    maxBoundsViscosity: 1.0,   // nu lasă harta să fie trasă în afara bounds
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
}).addTo(map);

// Forțează recalcularea dimensiunii după render
setTimeout(() => map.invalidateSize(), 100);

const markerIcon = L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 10.76 14.24 23.28 15.25 24.19a1 1 0 0 0 1.5 0C17.76 39.28 32 26.76 32 16 32 7.16 24.84 0 16 0z" fill="#e53e3e"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
});

let marker     = null;
let lastLatLng = null;   // ultima poziție validă (pentru snap-back la drag)

const locationInfo        = document.getElementById('location-info');
const locationText        = document.getElementById('location-text');
const locationPlaceholder = document.getElementById('location-placeholder');
const latInput            = document.getElementById('lat');
const lngInput            = document.getElementById('lng');

// ── TOAST ────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
    let toast = document.getElementById('map-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'map-toast';
        document.getElementById('map').parentElement.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function setMarker(latlng) {
    if (!GALATI_BOUNDS.contains(latlng)) {
        showToast('⚠ Poți marca doar locații din orașul Galați.');
        return;
    }
    if (marker) {
        marker.setLatLng(latlng);
    } else {
        marker = L.marker(latlng, { icon: markerIcon, draggable: true }).addTo(map);
        marker.on('dragstart', () => { lastLatLng = marker.getLatLng(); });
        marker.on('dragend', () => {
            const pos = marker.getLatLng();
            if (!GALATI_BOUNDS.contains(pos)) {
                marker.setLatLng(lastLatLng);
                showToast('⚠ Poți marca doar locații din orașul Galați.');
                updateLocation(lastLatLng);
            } else {
                lastLatLng = pos;
                updateLocation(pos);
            }
        });
    }
    lastLatLng = latlng;
    updateLocation(latlng);
}

function updateLocation(latlng) {
    const lat = latlng.lat.toFixed(5);
    const lng = latlng.lng.toFixed(5);
    latInput.value = lat;
    lngInput.value = lng;
    locationText.textContent = `${lat}, ${lng}`;
    locationInfo.hidden        = false;
    locationPlaceholder.hidden = true;
}

function clearMarker() {
    if (marker) {
        map.removeLayer(marker);
        marker = null;
    }
    lastLatLng             = null;
    latInput.value         = '';
    lngInput.value         = '';
    locationInfo.hidden    = true;
    locationPlaceholder.hidden = false;
}

map.on('click', e => setMarker(e.latlng));

document.getElementById('location-clear').addEventListener('click', clearMarker);

// ── SESIZĂRI EXISTENTE (mock — înlocuiește cu fetch('/api/sesizari') când ai backend) ──
const CAT_COLORS = {
    'Infrastructură deteriorată': '#f97316',
    'Iluminat stradal':           '#eab308',
    'Gunoi / Salubritate':        '#22c55e',
    'Spații verzi':               '#10b981',
    'Transport public':           '#3b82f6',
    'Siguranță rutieră':          '#e53e3e',
    'Altele':                     '#94a3b8',
};

const MOCK_SESIZARI = [
    { lat: 45.4420, lng: 28.0480, cat: 'Infrastructură deteriorată', titlu: 'Groapă pe str. Brăilei' },
    { lat: 45.4380, lng: 28.0550, cat: 'Iluminat stradal',           titlu: 'Stâlp defect lângă parc' },
    { lat: 45.4310, lng: 28.0430, cat: 'Gunoi / Salubritate',        titlu: 'Gunoi necolectat 3 zile' },
    { lat: 45.4460, lng: 28.0600, cat: 'Spații verzi',               titlu: 'Copac căzut pe trotuar' },
    { lat: 45.4350, lng: 28.0650, cat: 'Transport public',           titlu: 'Stație fără adăpost ploaie' },
    { lat: 45.4400, lng: 28.0390, cat: 'Siguranță rutieră',          titlu: 'Marcaj rutier șters' },
    { lat: 45.4290, lng: 28.0520, cat: 'Altele',                     titlu: 'Graffiti pe clădire istorică' },
    { lat: 45.4470, lng: 28.0510, cat: 'Infrastructură deteriorată', titlu: 'Bordură spartă Micro 17' },
    { lat: 45.4330, lng: 28.0700, cat: 'Gunoi / Salubritate',        titlu: 'Container supraaglomerat' },
    { lat: 45.4410, lng: 28.0300, cat: 'Iluminat stradal',           titlu: 'Stradă neiluminată noaptea' },
];

function makeExistingIcon(color) {
    return L.divIcon({
        className: '',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 32 40">
            <path d="M16 0C7.16 0 0 7.16 0 16c0 10.76 14.24 23.28 15.25 24.19a1 1 0 0 0 1.5 0C17.76 39.28 32 26.76 32 16 32 7.16 24.84 0 16 0z" fill="${color}"/>
            <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>`,
        iconSize: [24, 30],
        iconAnchor: [12, 30],
        popupAnchor: [0, -32],
    });
}

// Construiește markerii existenți
const existingMarkers = MOCK_SESIZARI.map(s => {
    const m = L.marker([s.lat, s.lng], {
        icon: makeExistingIcon(CAT_COLORS[s.cat] || '#94a3b8'),
    });
    m.sesizareCategorie = s.cat;
    m.bindPopup(`<strong>${s.titlu}</strong><br><span style="font-size:.85em;color:#64748b">${s.cat}</span>`);
    m.addTo(map);
    return m;
});

// ── FILTRE ───────────────────────────────────────────────
const activeFilters = new Set(['toate']);
let allHidden = false;

function applyFilters() {
    existingMarkers.forEach(m => {
        const catMatch = activeFilters.has('toate') || activeFilters.has(m.sesizareCategorie);
        if (!allHidden && catMatch) {
            if (!map.hasLayer(m)) m.addTo(map);
        } else {
            if (map.hasLayer(m)) map.removeLayer(m);
        }
    });
}

document.getElementById('map-filters').addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    const cat = chip.dataset.cat;

    if (cat === 'toate') {
        // activează toate
        activeFilters.clear();
        activeFilters.add('toate');
        document.querySelectorAll('.filter-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.cat === 'toate');
        });
    } else {
        // dezactivează "Toate" când alegi specific
        activeFilters.delete('toate');
        document.querySelector('.filter-chip[data-cat="toate"]').classList.remove('active');

        if (activeFilters.has(cat)) {
            activeFilters.delete(cat);
            chip.classList.remove('active');
            // dacă nu mai e nimic selectat, revin la "Toate"
            if (activeFilters.size === 0) {
                activeFilters.add('toate');
                document.querySelector('.filter-chip[data-cat="toate"]').classList.add('active');
            }
        } else {
            activeFilters.add(cat);
            chip.classList.add('active');
        }
    }

    allHidden = false;
    btnHideAll.textContent = 'Ascunde tot';
    btnHideAll.classList.remove('hidden-state');
    applyFilters();
});

const btnHideAll = document.getElementById('btn-hide-all');

btnHideAll.addEventListener('click', () => {
    allHidden = !allHidden;
    btnHideAll.textContent = allHidden ? 'Arată tot' : 'Ascunde tot';
    btnHideAll.classList.toggle('hidden-state', allHidden);
    applyFilters();
});

// ── RESET ────────────────────────────────────────────────
document.getElementById('btn-reset').addEventListener('click', () => {
    clearMarker();
    setTip('urgenta');
});

// ── SUBMIT ───────────────────────────────────────────────
const form = document.getElementById('sesizari-form');

form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!latInput.value || !lngInput.value) {
        alert('Te rugăm să marchezi locația pe hartă.');
        return;
    }

    const tipActiv = document.querySelector('.toggle-btn.active').dataset.tip;

    const payload = {
        tip:       tipActiv,
        categorie: document.getElementById('categorie').value,
        prioritate: document.getElementById('prioritate').value,
        titlu:     document.getElementById('titlu').value.trim(),
        descriere: document.getElementById('descriere').value.trim(),
        lat:       parseFloat(latInput.value),
        lng:       parseFloat(lngInput.value),
    };

    try {
        const res  = await fetch('/api/sesizari', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.succes) {
            alert('Sesizarea a fost trimisă cu succes!');
            form.reset();
            clearMarker();
            setTip('urgenta');
        } else {
            alert('Eroare la trimitere. Încearcă din nou.');
        }
    } catch (err) {
        console.error(err);
        alert('Eroare de rețea.');
    }
});
