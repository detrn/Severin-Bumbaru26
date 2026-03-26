// ── TOGGLE ──────────────────────────────────────────────
const toggleBtns   = document.querySelectorAll('.toggle-btn');
const selectedRow  = document.getElementById('selected-row');
const selectedText = document.getElementById('selected-text');
const formSubtitle = document.getElementById('form-subtitle');
const prioritySel  = document.getElementById('prioritate');

function setTip(tip) {
    toggleBtns.forEach(b => b.classList.toggle('active', b.dataset.tip === tip));

    if (tip === 'urgenta') {
        selectedRow.classList.remove('obisnuita');
        selectedText.textContent  = 'Sesizare urgentă';
        formSubtitle.textContent  = 'Sesizările urgente sunt prioritizate și procesate primul.';
        prioritySel.selectedIndex = 0;
    } else {
        selectedRow.classList.add('obisnuita');
        selectedText.textContent  = 'Sesizare obișnuită';
        formSubtitle.textContent  = 'Sesizările obișnuite sunt procesate în ordinea primirii.';
        prioritySel.selectedIndex = 2;
    }
}

toggleBtns.forEach(b => b.addEventListener('click', () => setTip(b.dataset.tip)));

// ── MAP ─────────────────────────────────────────────────
const GALATI = [45.4353, 28.0507];

const map = L.map('map', {
    center: GALATI,
    zoom: 14,
    zoomControl: true,
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

let marker = null;

const locationInfo        = document.getElementById('location-info');
const locationText        = document.getElementById('location-text');
const locationPlaceholder = document.getElementById('location-placeholder');
const latInput            = document.getElementById('lat');
const lngInput            = document.getElementById('lng');

function setMarker(latlng) {
    if (marker) {
        marker.setLatLng(latlng);
    } else {
        marker = L.marker(latlng, { icon: markerIcon, draggable: true }).addTo(map);
        marker.on('dragend', e => updateLocation(e.target.getLatLng()));
    }
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
    latInput.value             = '';
    lngInput.value             = '';
    locationInfo.hidden        = true;
    locationPlaceholder.hidden = false;
}

map.on('click', e => setMarker(e.latlng));

document.getElementById('location-clear').addEventListener('click', clearMarker);

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
