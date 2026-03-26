// events.js
function initEvents() {
    document.querySelector('#btn-sesizare')?.addEventListener('click', () => {
        window.location.href = 'sesizari.html';
    });
    document.querySelector('#btn-afla-mai-multe')?.addEventListener('click', () => {
        window.location.href = 'toate-sesizarile.html';
    });
}

// ===== LOGIN & SIGNUP — se execută automat, nu depind de initEvents =====
document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#form-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email  = document.querySelector('#email').value;
        const parola = document.querySelector('#parola').value;
        const res    = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, parola })
        });
        const data = await res.json();
        if (data.succes) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/index.html';
        } else {
            document.querySelector('#mesaj-eroare').textContent = data.mesaj;
        }
    });

    document.querySelector('#form-signup')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nume   = document.querySelector('#nume').value;
        const email  = document.querySelector('#email').value;
        const parola = document.querySelector('#parola').value;
        const res    = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nume, email, parola })
        });
        const data = await res.json();
        if (data.succes) {
            window.location.href = '/login.html';
        } else {
            document.querySelector('#mesaj-eroare').textContent = data.mesaj;
        }
    });

});
