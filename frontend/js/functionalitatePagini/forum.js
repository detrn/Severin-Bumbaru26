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

    // ADAUGĂ ASTA: Încarcă comentariile după ce propunerile sunt afișate
    await loadAllComments();

  } catch (err) {
    console.error("❌ Eroare critică la încărcare:", err);
    container.innerHTML = `
      <div style="text-align:center; padding:50px; color:#e53e3e;">
        <i data-lucide="alert-triangle" style="width:48px; height:48px;"></i>
        <p>Eroare la încărcare. Verifică consola (F12) pentru detalii.</p>
      </div>`;
    if (window.lucide) lucide.createIcons();
  }
}

function renderForum() {
  const container = document.getElementById("feed-list");
  const sortBy = document.getElementById("sortBy").value;
  const searchQuery = document
      .getElementById("searchInput")
      .value.toLowerCase();


  let filtered = allProposals.filter((p) => {
    const matchesType = currentFilter === "all" || p.tip === currentFilter;
    const titlu = (p.titlu || "").toLowerCase();
    const desc = (p.descriere || p.problema || p.sesizare || "").toLowerCase();
    const matchesSearch =
        titlu.includes(searchQuery) || desc.includes(searchQuery);
    return matchesType && matchesSearch;
  });


  filtered.sort((a, b) => {
    if (sortBy === "votes") return (b.numarVoturi || 0) - (a.numarVoturi || 0);
    if (sortBy === "newest")
      return new Date(b.dataCreare || 0) - new Date(a.dataCreare || 0);
    return 0;
  });

  container.innerHTML = filtered
      .map((p) => {
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
  <article class="pcard" data-propunere-id="${cleanId}">
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
      

<div class="comments-section">
  <h4>Comentarii</h4>
  <div id="comments-${cleanId}" class="comments-list">
    <div class="loading">Încărcare comentarii...</div>
  </div>
  
  <div class="add-comment">
    <textarea id="continut-${cleanId}" placeholder="Scrie un comentariu..." rows="2" class="comment-textarea"></textarea>
    <button onclick="submitComment('${cleanId}')" class="btn-comment">Adaugă comentariu</button>
  </div>
</div>
    </div>
  </article>`;
      })
      .join("");

  if (window.lucide) lucide.createIcons();
}

// ===== FUNCȚII PENTRU COMENTARII =====

// Încarcă toate comentariile pentru toate propunerile
async function loadAllComments() {
  for (const propunere of allProposals) {
    const rawId = propunere._id?.$oid || propunere._id;
    const id = String(rawId);
    await loadAndDisplayComments(id);
  }
}

async function loadAndDisplayComments(propunereId) {
  try {
    const response = await fetch(`/api/comentarii?propunereId=${propunereId}`);
    const comentarii = await response.json();

    const container = document.getElementById(`comments-${propunereId}`);
    if (!container) return;

    if (!comentarii || comentarii.length === 0) {
      container.innerHTML = '<div class="no-comments">Niciun comentariu încă. Fii primul!</div>';
    } else {
      container.innerHTML = comentarii.map(c => {
        // Format: 26 martie 2026, 14:30
        const data = new Date(c.dataCreare);
        const dataFormatata = data.toLocaleDateString('ro-RO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const oraFormatata = data.toLocaleTimeString('ro-RO', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return `
          <div class="comment-item">
            <div class="comment-header">
              <strong>${c.autor || 'Anonim'}</strong>
              <small>${dataFormatata}, ${oraFormatata}</small>
            </div>
            <div class="comment-content">${c.continut}</div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error(`Eroare la încărcarea comentariilor pentru ${propunereId}:`, err);
    const container = document.getElementById(`comments-${propunereId}`);
    if (container) {
      container.innerHTML = '<div class="error">Eroare la încărcare</div>';
    }
  }
}
window.submitComment = async function(propunereId) {
  const continut = document.getElementById(`continut-${propunereId}`).value.trim();

  if (!continut) {
    alert('Scrie un comentariu!');
    return;
  }

  let autor = "Anonim";
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      autor = user.nume || user.email || "Anonim";
    }
  } catch (e) {
    console.error("Eroare la citirea userului:", e);
  }

  try {
    const response = await fetch('/api/comentarii', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propunereId: propunereId,
        autor: autor,
        continut: continut
      })
    });

    const result = await response.json();

    if (result.succes) {

      document.getElementById(`continut-${propunereId}`).value = '';
      await loadAndDisplayComments(propunereId);
    } else {
      alert('Eroare la salvarea comentariului: ' + (result.error || 'eroare necunoscută'));
    }
  } catch (err) {
    console.error('Eroare:', err);
    alert('Eroare de conectare la server');
  }
};

// ===== FUNCȚII EXISTENTE =====

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

// PORNIRE
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Pagina s-a încărcat, pornesc loadProposals()");
  loadProposals();
});