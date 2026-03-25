const toggleBtns = document.querySelectorAll('.toggle-btn');
const selectedText = document.getElementById('selected-text');
const formSubtitle = document.getElementById('form-subtitle');
const templateText = document.getElementById('template-text');

const campuriOrasCategorie = document.getElementById('campuri-oras-categorie');
const campuriOrasZona = document.getElementById('campuri-oras-zona');
const campuriSiteSectiune = document.getElementById('campuri-site-sectiune');
const campuriSiteTip = document.getElementById('campuri-site-tip');

function setTip(tip) {
    toggleBtns.forEach(b => b.classList.toggle('active', b.dataset.tip === tip));

    if (tip === 'oras') {
        campuriOrasCategorie.hidden = false;
        campuriOrasZona.hidden = false;
        campuriSiteSectiune.hidden = true;
        campuriSiteTip.hidden = true;

        selectedText.textContent = 'Propunere pentru oraș';
        formSubtitle.textContent = 'Detaliile pentru propunerea ta legată de oraș.';
        templateText.textContent =
            'Titlu propunere:\nProblema actuală:\nZona vizată:\nSoluția propusă:\nBeneficii:\nObservații suplimentare:';
    } else {
        campuriOrasCategorie.hidden = true;
        campuriOrasZona.hidden = true;
        campuriSiteSectiune.hidden = false;
        campuriSiteTip.hidden = false;

        selectedText.textContent = 'Propunere pentru site';
        formSubtitle.textContent = 'Detaliile pentru propunerea ta legată de site.';
        templateText.textContent =
            'Titlu propunere:\nSecțiunea site-ului:\nProblema observată:\nÎmbunătățirea propusă:\nBeneficii pentru utilizatori:\nObservații suplimentare:';
    }
}

toggleBtns.forEach(b => b.addEventListener('click', () => setTip(b.dataset.tip)));

const form = document.getElementById('propuneri-form');

form.addEventListener('submit', async e => {
    e.preventDefault();

    const tipActiv = document.querySelector('.toggle-btn.active').dataset.tip;

    const payload = {
        tip:      tipActiv,
        titlu:    document.getElementById('titlu').value.trim(),
        problema: document.getElementById('problema').value.trim(),
        solutie:  document.getElementById('solutie').value.trim(),
        impact:   document.getElementById('impact').value.trim(),

        // câmpuri oraș
        categorieOras: tipActiv === 'oras'
            ? document.getElementById('categorie-oras').value : null,
        zonaOras: tipActiv === 'oras'
            ? document.getElementById('zona-oras').value.trim() : null,

        // câmpuri site
        sectiuneSite: tipActiv === 'site'
            ? document.getElementById('sectiune-site').value : null,
        tipSite: tipActiv === 'site'
            ? document.getElementById('tip-site').value : null,
    };

    try {
        const res = await fetch('/api/propuneri', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.succes) {
            alert('Propunerea a fost trimisă cu succes!');
            form.reset();
        } else {
            alert('Eroare la trimitere. Încearcă din nou.');
        }
    } catch (err) {
        console.error(err);
        alert('Eroare de rețea.');
    }
});