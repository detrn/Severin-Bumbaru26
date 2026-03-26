// ===== FETCH / API =====
const API_BASE = "http://localhost:3000/api";

async function getData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) throw new Error(`Eroare: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
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

window.moveSlider = function (index) {
  const track = document.getElementById("slider-track");
  const cards = document.querySelectorAll(".img-card");
  const buttons = document.querySelectorAll(".pastille-btn");
  const viewport = document.querySelector(".slider-viewport");

  if (!track || cards.length === 0 || buttons.length === 0 || !viewport) return;

  const card = cards[index];
  const viewportCenter = viewport.offsetWidth / 2;
  const cardCenter = card.offsetLeft + card.offsetWidth / 2;
  const translation = viewportCenter - cardCenter;

  track.style.transform = `translateX(${translation}px)`;

  buttons.forEach((btn, i) => {
    if (i === index) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  cards.forEach((c, i) => {
    if (i === index) {
      c.classList.remove("inactive-card");
      c.classList.add("active-card");
    } else {
      c.classList.remove("active-card");
      c.classList.add("inactive-card");
    }
  });
};

window.addEventListener("load", () => {
  if (document.getElementById("slider-track")) {
    window.moveSlider(0);
  }
});

window.addEventListener("resize", () => {
  if (document.getElementById("slider-track")) {
    const activeIndex = Array.from(
      document.querySelectorAll(".pastille-btn"),
    ).findIndex((b) => b.classList.contains("active"));
    window.moveSlider(activeIndex >= 0 ? activeIndex : 0);
  }
});

// Aici e logica de butoane "Află mai multe" și "Depune sesizare"
window.addEventListener("load", function () {
  const btnAfla = document.getElementById("btn-afla-mai-multe");
  const btnSesizare = document.getElementById("btn-sesizare");

  if (btnAfla) {
    btnAfla.onclick = function (e) {
      e.preventDefault();
      window.location.href = "despre.html";
    };
  }

  if (btnSesizare) {
    btnSesizare.onclick = function (e) {
      e.preventDefault();
      window.location.href = "sesizari.html";
    };
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("sesizari-toggle");
  const menu = document.querySelector(".dropdown-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      menu.classList.remove("show");
    });
  }
});
