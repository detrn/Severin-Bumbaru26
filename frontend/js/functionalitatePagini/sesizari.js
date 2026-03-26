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

// ── MAP ──────────────────────────────────────────────────
const GALATI        = [45.4353, 28.0507];
const GALATI_BOUNDS = L.latLngBounds(
    L.latLng(45.38, 27.93),
    L.latLng(45.50, 28.15)
);

const map = L.map('map', {
    center: GALATI, zoom: 14, minZoom: 12, maxZoom: 19,
    maxBounds: GALATI_BOUNDS, maxBoundsViscosity: 1.0,
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
}).addTo(map);
setTimeout(() => map.invalidateSize(), 100);

// ── MARKERUL UTILIZATORULUI (roșu, draggable) ────────────
const markerIcon = L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 10.76 14.24 23.28 15.25 24.19a1 1 0 0 0 1.5 0C17.76 39.28 32 26.76 32 16 32 7.16 24.84 0 16 0z" fill="#e53e3e"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
    </svg>`,
    iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -42],
});

let marker = null, lastLatLng = null;
const locationInfo        = document.getElementById('location-info');
const locationText        = document.getElementById('location-text');
const locationPlaceholder = document.getElementById('location-placeholder');
const latInput            = document.getElementById('lat');
const lngInput            = document.getElementById('lng');

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
    locationText.textContent   = `${lat}, ${lng}`;
    locationInfo.hidden        = false;
    locationPlaceholder.hidden = true;
}

function clearMarker() {
    if (marker) { map.removeLayer(marker); marker = null; }
    lastLatLng = null;
    latInput.value = ''; lngInput.value = '';
    locationInfo.hidden = true; locationPlaceholder.hidden = false;
}

map.on('click', e => setMarker(e.latlng));
document.getElementById('location-clear').addEventListener('click', clearMarker);

// ── SESIZĂRI EXISTENTE DIN DB (înlocuiește MOCK_SESIZARI) ─
const CAT_COLORS = {
    'Infrastructură deteriorată': '#f97316',
    'Iluminat stradal':           '#eab308',
    'Gunoi / Salubritate':        '#22c55e',
    'Spații verzi':               '#10b981',
    'Transport public':           '#3b82f6',
    'Siguranță rutieră':          '#e53e3e',
    'Altele':                     '#94a3b8',
};

// ← SCHIMBARE CHEIE: let în loc de const, populat din fetch
let existingMarkers = [];

function makeExistingIcon(color) {
    return L.divIcon({
        className: '',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 32 40">
            <path d="M16 0C7.16 0 0 7.16 0 16c0 10.76 14.24 23.28 15.25 24.19a1 1 0 0 0 1.5 0C17.76 39.28 32 26.76 32 16 32 7.16 24.84 0 16 0z" fill="${color}"/>
            <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>`,
        iconSize: [24, 30], iconAnchor: [12, 30], popupAnchor: [0, -32],
    });
}

// Funcție care înțelege atât schema veche cât și cea nouă
function normalizeSesizare(s) {
    const autorVechi = [s.prenume, s.nume].filter(Boolean).join(' ');
    return {
        titlu:     s.titlu     || s.sesizare         || '(fără titlu)',
        categorie: s.categorie || s.criteriuSesizare || 'Altele',
        autor:     s.autor     || autorVechi          || 'Anonim',
        lat:       s.lat       || null,
        lng:       s.lng       || null,
    };
}

async function loadExistingMarkers() {
    try {
        const res  = await fetch('/api/reports');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Curăță markerii vechi
        existingMarkers.forEach(m => map.removeLayer(m));
        existingMarkers = [];

        data.forEach(raw => {
            const s = normalizeSesizare(raw);
            if (!s.lat || !s.lng) return; // sări sesizările fără coordonate
            const color = CAT_COLORS[s.categorie] || '#94a3b8';
            const m = L.marker([s.lat, s.lng], { icon: makeExistingIcon(color) });
            m.sesizareCategorie = s.categorie;
            m.bindPopup(`<strong>${s.titlu}</strong><br>
                <span style="font-size:.85em;color:#64748b">${s.categorie}</span><br>
                <span style="font-size:.78em;color:#94a3b8">de ${s.autor}</span>`);
            m.addTo(map);
            existingMarkers.push(m);
        });

        console.log(`[Hartă] ${existingMarkers.length} pini încărcați din DB`);
    } catch (err) {
        console.warn('[Hartă] Eroare la încărcarea sesizărilor:', err.message);
    }
}

// Încarcă pinii la pornirea paginii
loadExistingMarkers();

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
        activeFilters.clear();
        activeFilters.add('toate');
        document.querySelectorAll('.filter-chip').forEach(c =>
            c.classList.toggle('active', c.dataset.cat === 'toate'));
    } else {
        activeFilters.delete('toate');
        document.querySelector('.filter-chip[data-cat="toate"]').classList.remove('active');
        if (activeFilters.has(cat)) {
            activeFilters.delete(cat);
            chip.classList.remove('active');
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

    const userStored = localStorage.getItem('user');
    const autor = userStored ? (JSON.parse(userStored).nume || 'Anonim') : 'Anonim';
    const tipActiv = document.querySelector('.toggle-btn.active').dataset.tip;

    const payload = {
        autor,
        tip:        tipActiv,
        categorie:  document.getElementById('categorie').value,
        prioritate: document.getElementById('prioritate').value,
        titlu:      document.getElementById('titlu').value.trim(),
        descriere:  document.getElementById('descriere').value.trim(),
        lat:        parseFloat(latInput.value),
        lng:        parseFloat(lngInput.value),
    };

    try {
        const res  = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.succes) {
            alert('Sesizarea a fost trimisă cu succes!');
            form.reset();
            clearMarker();
            setTip('urgenta');
            loadExistingMarkers(); // ← pinul nou apare imediat pe hartă
        } else {
            alert('Eroare la trimitere: ' + (data.mesaj || 'Încearcă din nou.'));
        }
    } catch (err) {
        console.error(err);
        alert('Eroare de rețea: ' + err.message);
    }
});
