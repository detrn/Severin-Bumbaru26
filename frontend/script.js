const form = document.getElementById('reportForm');
const reportsDiv = document.getElementById('reports');

// trimite sesizare
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    titlu: document.getElementById('titlu').value,
    descriere: document.getElementById('descriere').value,
    categorie: document.getElementById('categorie').value,
  };

  await fetch('http://localhost:3000/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  loadReports();
});

// încarcă sesizări
async function loadReports() {
  const res = await fetch('http://localhost:3000/reports');
  const reports = await res.json();

  reportsDiv.innerHTML = '';

  reports.forEach((r) => {
    const div = document.createElement('div');
    div.className = 'report';

    div.innerHTML = `
      <b>${r.titlu}</b><br>
      ${r.descriere}<br>
      Status: ${r.status}<br>
      <button onclick="updateStatus(${r.id}, 'in lucru')">În lucru</button>
      <button onclick="updateStatus(${r.id}, 'rezolvat')">Rezolvat</button>
    `;

    reportsDiv.appendChild(div);
  });
}

// update status
async function updateStatus(id, status) {
  await fetch(`http://localhost:3000/report/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  loadReports();
}

// load initial
loadReports();
