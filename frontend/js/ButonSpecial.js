let currentFontSize = 100;

function changeFont(step) {
  currentFontSize += step * 10;
  if (currentFontSize < 80) currentFontSize = 80;
  if (currentFontSize > 150) currentFontSize = 150;

  document.documentElement.style.fontSize = currentFontSize + "%";
  const fontValEl = document.getElementById("font-val");
  if (fontValEl) {
    fontValEl.innerText = currentFontSize + "%";
  }
}

function toggleA11y(type, btnElement) {
  // Verificăm starea actuală
  const isActive = btnElement.getAttribute("aria-pressed") === "true";

  // Schimbăm starea (Toggle)
  btnElement.setAttribute("aria-pressed", !isActive);

  // Adăugăm/scoatem clasa pe body (Aici se întâmplă magia vizuală)
  const className = `a11y-${type}`;
  document.body.classList.toggle(className);
}

function resetA11y() {
  currentFontSize = 100;
  document.documentElement.style.fontSize = "100%";
  const fontValEl = document.getElementById("font-val");
  if (fontValEl) {
    fontValEl.innerText = "100%";
  }

  // Scoatem toate clasele de pe body
  const bodyClasses = [
    "a11y-contrast",
    "a11y-underline",
    "a11y-dyslexia",
    "a11y-cursor",
  ];
  bodyClasses.forEach((cls) => document.body.classList.remove(cls));

  // Resetăm butoanele vizual
  const allButtons = document.querySelectorAll(".a11y-option");
  allButtons.forEach((btn) => btn.setAttribute("aria-pressed", "false"));
}
