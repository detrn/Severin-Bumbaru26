let myVotes = JSON.parse(localStorage.getItem('myVotesPropuneri') || '{}');
let allProposals = [];
let currentFilter = "all";

async function loadProposals() {
  console.log("🔍 Încerc să preiau datele de la /api/propuneri...");
  const container = document.getElementById("feed-list");

  try {
    const response = await fetch("/api/propuneri");
    if (!response.ok) throw new Error(`Eroare Server: ${response.status}`);

    allProposals = await response.json();
    console.log("✅ Date primite din MongoDB:", allProposals);

    if (!Array.isArray(allProposals) || allProposals.length === 0) {
      container.innerHTML =
        '<div class="feed-empty"><p>Baza de date este goală.</p></div>';
      return;
    }

    renderForum();
    updateStats();
    buildLeaderboard();
  } catch (err) {
    console.error("❌ Eroare critică la încărcare:", err);
    container.innerHTML = `
      <div style="text-align:center; padding:50px; color:#e53e3e;">
        <i data-lucide="alert-triangle" style="width:48px; height:48px;"></i>
        <p>Eroare la încărcare. Verifică consola (F12) pentru detalii.</p>
      </div>`;
    filtered.forEach(p => {
      const id = String(p._id?.$oid || p._id);
      actualizezaButoane(id, myVotes[id] || null);
    });
    if (window.lucide) lucide.createIcons();
  }

}

function renderForum() {
  const container = document.getElementById("feed-list");
  const sortBy = document.getElementById("sortBy").value;
  const searchQuery = document
    .getElementById("searchInput")
    .value.toLowerCase();

  // 1. Filtrare
  let filtered = allProposals.filter((p) => {
    const matchesType = currentFilter === "all" || p.tip === currentFilter;
    const titlu = (p.titlu || "").toLowerCase();
    const desc = (p.descriere || p.problema || p.sesizare || "").toLowerCase();
    const matchesSearch =
      titlu.includes(searchQuery) || desc.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  // 2. Sortare
  filtered.sort((a, b) => {
    if (sortBy === "votes") return (b.numarVoturi || 0) - (a.numarVoturi || 0);
    if (sortBy === "newest")
      return new Date(b.dataCreare || 0) - new Date(a.dataCreare || 0);
    return 0;
  });

  // 3. Generare HTML
  container.innerHTML = filtered
    .map((p) => {
      // REPARARE ID: MongoDB trimite _id ca string sau ca obiect {$oid: "..."}
      const rawId = p._id?.$oid || p._id;
      const cleanId = String(rawId);

      const dateStr = p.dataCreare
        ? new Date(p.dataCreare).toLocaleDateString("ro-RO")
        : "—";
      const tipClass = p.tip === "site" ? "ptag-site" : "ptag-oras";
      const icon = p.tip === "site" ? "monitor" : "building-2";
      const continutText =
        p.descriere || p.problema || p.sesizare || "Fără descriere";

      return `
  <article class="pcard">
    <div class="vstrip" data-vote-id="${cleanId}">
      <button class="vbtn up" onclick="handleVote('${cleanId}', 'up')">
          <i data-lucide="chevron-up"></i>
      </button>
      <span class="vnum">${p.numarVoturi || 0}</span>
      <button class="vbtn down" onclick="handleVote('${cleanId}', 'down')">
          <i data-lucide="chevron-down"></i>
      </button>
    </div>
    <div class="pbody">
      <div class="ptop">
        <span class="ptag ${tipClass}"><i data-lucide="${icon}"></i> ${p.tip?.toUpperCase() || "ORAȘ"}</span>
        <span class="status-pill status-lucru">${p.status || "în așteptare"}</span>
        <span style="margin-left:auto; font-size:0.8rem; color:#94a3b8;"><i data-lucide="calendar" style="width:12px"></i> ${dateStr}</span>
      </div>
      <h3 class="ptitle">${p.titlu || "Fără titlu"}</h3>
      <p style="color:var(--color-text-light); font-size:0.92rem; margin-bottom:15px;">${continutText}</p>
      <div class="pauthor" style="display:flex; align-items:center; gap:8px;">
         <div class="lb-avatar" style="width:24px; height:24px; font-size:0.7rem;">${(p.autor || p.nume || "A").charAt(0).toUpperCase()}</div>
         <span style="font-size:0.85rem; font-weight:600;">${p.autor || p.nume || "Anonim"}</span>
      </div>
    </div>
  </article>`;

    })
    .join("");

  if (window.lucide) lucide.createIcons();
}

// FUNCȚII GLOBALE (atașate la window pentru a merge cu onclick-urile din HTML)
window.filterByType = function (type) {
  currentFilter = type;
  document.querySelectorAll(".filter-chip").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-type") === type);
  });
  renderForum();
};

window.handleVote = async function (id, tip) {
  const votCurent = myVotes[id];
  let delta, votNou;

  if (votCurent === tip) {
    delta  = tip === 'up' ? -1 : +1;
    votNou = null;
  } else if (votCurent && votCurent !== tip) {
    delta  = tip === 'up' ? +2 : -2;
    votNou = tip;
  } else {
    delta  = tip === 'up' ? +1 : -1;
    votNou = tip;
  }

  try {
    const res = await fetch(`/api/propuneri/${id}/vote`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ delta }),
    });
    if (!(await res.json()).succes) return;

    if (votNou) myVotes[id] = votNou;
    else        delete myVotes[id];
    localStorage.setItem('myVotesPropuneri', JSON.stringify(myVotes));

    // Actualizează doar numărul și butoanele — fără reload complet
    const propunere = allProposals.find(p => (p._id?.$oid || p._id) === id);
    if (propunere) {
      propunere.numarVoturi = (propunere.numarVoturi || 0) + delta;
      document.querySelector(`[data-vote-id="${id}"] .vnum`).textContent = propunere.numarVoturi;
    }
    actualizezaButoane(id, votNou);
  } catch(err) {
    console.error('Eroare vot:', err);
  }
};

function actualizezaButoane(id, votActiv) {
  const btnUp   = document.querySelector(`[data-vote-id="${id}"] .vbtn.up`);
  const btnDown = document.querySelector(`[data-vote-id="${id}"] .vbtn.down`);
  if (btnUp)   btnUp.classList.toggle('lit-up', votActiv === 'up');
  if (btnDown) btnDown.classList.toggle('lit-up', votActiv === 'down');
}


function updateStats() {
  const totalEl = document.getElementById("stat-total");
  const votesEl = document.getElementById("stat-votes");
  if (totalEl) totalEl.innerText = allProposals.length;
  if (votesEl)
    votesEl.innerText = allProposals.reduce(
      (s, p) => s + (p.numarVoturi || 0),
      0,
    );
}

function buildLeaderboard() {
  const container = document.getElementById("leaderboard");
  if (!container) return;
  const counts = {};
  allProposals.forEach((p) => {
    const a = p.autor || p.nume || "Anonim";
    counts[a] = (counts[a] || 0) + 1;
  });
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  container.innerHTML = sorted
    .map(
      ([name, count]) => `
    <div class="lb-row">
      <div class="lb-avatar">${name.charAt(0)}</div>
      <div style="flex:1">
        <div style="font-size:0.85rem; font-weight:700;">${name}</div>
        <div style="font-size:0.7rem; color:#94a3b8;">${count} contribuții</div>
      </div>
    </div>
  `,
    )
    .join("");
}

// PORNIRE - Folosim DOMContentLoaded pentru siguranță
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Pagina s-a încărcat, pornesc loadProposals()");
  loadProposals();
});
