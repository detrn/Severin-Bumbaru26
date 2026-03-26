const toggleBtns = document.querySelectorAll(".toggle-btn");
const selectedText = document.getElementById("selected-text");
const formSubtitle = document.getElementById("form-subtitle");
const templateText = document.getElementById("template-text");

const campuriOrasCategorie = document.getElementById("campuri-oras-categorie");
const campuriOrasZona = document.getElementById("campuri-oras-zona");
const campuriSiteSectiune = document.getElementById("campuri-site-sectiune");
const campuriSiteTip = document.getElementById("campuri-site-tip");
const form = document.getElementById("propuneri-form");
const API_BASE =
  window.location.protocol === "file:" ? "http://localhost:3000/api" : "/api";

function setTip(tip) {
  toggleBtns.forEach((button) => {
    button.classList.toggle("active", button.dataset.tip === tip);
  });

  if (tip === "oras") {
    campuriOrasCategorie.hidden = false;
    campuriOrasZona.hidden = false;
    campuriSiteSectiune.hidden = true;
    campuriSiteTip.hidden = true;

    selectedText.textContent = "Propunere pentru oras";
    formSubtitle.textContent = "Detaliile pentru propunerea ta legata de oras.";
    templateText.textContent =
      "Titlu propunere:\nProblema actuala:\nZona vizata:\nSolutia propusa:\nBeneficii:\nObservatii suplimentare:";
    return;
  }

  campuriOrasCategorie.hidden = true;
  campuriOrasZona.hidden = true;
  campuriSiteSectiune.hidden = false;
  campuriSiteTip.hidden = false;

  selectedText.textContent = "Propunere pentru site";
  formSubtitle.textContent = "Detaliile pentru propunerea ta legata de site.";
  templateText.textContent =
    "Titlu propunere:\nSectiunea site-ului:\nProblema observata:\nImbunatatirea propusa:\nBeneficii pentru utilizatori:\nObservatii suplimentare:";
}

toggleBtns.forEach((button) => {
  button.addEventListener("click", () => setTip(button.dataset.tip));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const tipActiv =
    document.querySelector(".toggle-btn.active")?.dataset.tip || "oras";
  const userStored = localStorage.getItem("user");
  const parsedUser = userStored ? JSON.parse(userStored) : null;
  const localUserName = localStorage.getItem("userName");

  const payload = {
    autor:
      parsedUser?.nume ||
      (localUserName && localUserName !== "Vizitator"
        ? localUserName
        : "Anonim"),
    tip: tipActiv,
    titlu: document.getElementById("titlu").value.trim(),
    problema: document.getElementById("problema").value.trim(),
    solutie: document.getElementById("solutie").value.trim(),
    impact: document.getElementById("impact").value.trim(),
    categorieOras:
      tipActiv === "oras"
        ? document.getElementById("categorie-oras").value
        : null,
    zonaOras:
      tipActiv === "oras"
        ? document.getElementById("zona-oras").value.trim()
        : null,
    sectiuneSite:
      tipActiv === "site"
        ? document.getElementById("sectiune-site").value
        : null,
    tipSite:
      tipActiv === "site" ? document.getElementById("tip-site").value : null,
  };

  try {
    const response = await fetch(`${API_BASE}/propuneri`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.succes) {
      throw new Error(data.mesaj || "Trimiterea propunerii a esuat.");
    }

    alert("Propunerea a fost trimisa cu succes!");
    form.reset();
    setTip("oras");
  } catch (error) {
    console.error(error);
    alert(`Eroare la trimitere: ${error.message}`);
  }
});
