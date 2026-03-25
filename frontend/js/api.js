// ===== FETCH / API =====
const API_BASE = 'http://localhost:3000/api';

async function getData(endpoint) {
    try {
        const res = await fetch(`${API_BASE}/${endpoint}`);
        if (!res.ok) throw new Error(`Eroare: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('API error:', err);
        return null;
    }
}

async function postData(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

function IntraCaOaspete() {
  localStorage.setItem("userRole", "Oaspete");
  localStorage.setItem("userName", "Vizitator");

  window.location.href = "index.html";
}
