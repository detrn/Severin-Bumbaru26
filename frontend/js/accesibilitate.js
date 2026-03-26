window.togglePanel = function () {
  const panel = document.getElementById("a11y-panel");
  if (panel) {
    const isVisible = panel.style.display === "flex";
    panel.style.display = isVisible ? "none" : "flex";
    panel.classList.toggle("show");
  }
};

function loadAccessibilityWidget() {
  const widgetHTML = `
    <div id="a11y-widget">
        <div id="a11y-panel">
            <div class="a11y-heading">Accesibilitate</div>
            
            <div class="a11y-option" id="opt-fontsize">
                <div class="a11y-option__left">
                    <div class="a11y-option__icon"><i data-lucide="type"></i></div>
                    <div>
                        <div class="a11y-option__label">Mărime text</div>
                        <div class="a11y-option__sublabel">Ajustează dimensiunea</div>
                    </div>
                </div>
                <div class="a11y-size-ctrl">
                    <button type="button" onclick="changeFont(-1)">−</button>
                    <span class="a11y-size-val" id="font-val">100%</span>
                    <button type="button" onclick="changeFont(1)">+</button>
                </div>
            </div>

            <div class="a11y-divider"></div>

            <button class="a11y-option" onclick="toggleA11y('contrast', this)">
                <div class="a11y-option__left">
                    <div class="a11y-option__icon"><i data-lucide="moon"></i></div>
                    <div>
                        <div class="a11y-option__label">Contrast ridicat</div>
                        <div class="a11y-option__sublabel">Vizibilitate sporită</div>
                    </div>
                </div>
                <div class="a11y-switch"></div>
            </button>

            <button class="a11y-option" onclick="toggleA11y('underline', this)">
                <div class="a11y-option__left">
                    <div class="a11y-option__icon"><i data-lucide="link"></i></div>
                    <div>
                        <div class="a11y-option__label">Subliniere linkuri</div>
                        <div class="a11y-option__sublabel">Mai ușor de identificat</div>
                    </div>
                </div>
                <div class="a11y-switch"></div>
            </button>

            <button class="a11y-option" onclick="toggleA11y('dyslexia', this)">
                <div class="a11y-option__left">
                    <div class="a11y-option__icon"><i data-lucide="book-open"></i></div>
                    <div>
                        <div class="a11y-option__label">Font dislexie</div>
                        <div class="a11y-option__sublabel">Lectură facilitată</div>
                    </div>
                </div>
                <div class="a11y-switch"></div>
            </button>

            <button class="a11y-option" onclick="toggleA11y('cursor', this)">
                <div class="a11y-option__left">
                    <div class="a11y-option__icon"><i data-lucide="mouse-pointer-2"></i></div>
                    <div>
                        <div class="a11y-option__label">Cursor mare</div>
                        <div class="a11y-option__sublabel">Vizibilitate cursor</div>
                    </div>
                </div>
                <div class="a11y-switch"></div>
            </button>

            <div class="a11y-divider"></div>
            <button id="a11y-reset" type="button" onclick="resetA11y()">Resetează setările</button>
        </div>

        <button id="a11y-toggle" type="button" onclick="window.togglePanel()">
            <i data-lucide="accessibility"></i>
        </button>
    </div>
    `;

  document.body.insertAdjacentHTML("beforeend", widgetHTML);
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAccessibilityWidget);
} else {
  loadAccessibilityWidget();
}
