// Voturi salvate local: { "idPropunere": "up" | "down" }
let myVotes = JSON.parse(localStorage.getItem("myVotesPropuneri") || "{}");

async function voteaza(id, tip) {
  const votCurent = myVotes[id]; // 'up', 'down', sau undefined

  let delta, votNou;

  if (votCurent === tip) {
    // Același buton apăsat din nou → anulează votul
    delta = tip === "up" ? -1 : +1;
    votNou = null;
  } else if (votCurent && votCurent !== tip) {
    // Schimbă votul (ex: era up, acum vrea down) → sare 2 pași
    delta = tip === "up" ? +2 : -2;
    votNou = tip;
  } else {
    // Niciun vot anterior → vot nou
    delta = tip === "up" ? +1 : -1;
    votNou = tip;
  }

  try {
    const res = await fetch(`/api/propuneri/${id}/vote`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    if (!(await res.json()).succes) return;

    // Actualizează localStorage
    if (votNou) myVotes[id] = votNou;
    else delete myVotes[id];
    localStorage.setItem("myVotesPropuneri", JSON.stringify(myVotes));

    // Actualizează UI-ul butonului fără reload
    actualizezaButoane(id, votNou);
  } catch (err) {
    console.error("Eroare vot:", err);
  }
}

function actualizezaButoane(id, votActiv) {
  const btnUp = document.querySelector(`[data-vote-up="${id}"]`);
  const btnDown = document.querySelector(`[data-vote-down="${id}"]`);
  if (btnUp) btnUp.classList.toggle("active", votActiv === "up");
  if (btnDown) btnDown.classList.toggle("active", votActiv === "down");
}
