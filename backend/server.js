const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let reports = [];

// Creează sesizare
app.post('/report', (req, res) => {
  const report = {
    id: Date.now(),
    ...req.body,
    status: 'in asteptare',
  };
  reports.push(report);
  res.json(report);
});

// Listează sesizări
app.get('/reports', (req, res) => {
  res.json(reports);
});

// Update status
app.put('/report/:id', (req, res) => {
  const report = reports.find((r) => r.id == req.params.id);
  if (report) {
    report.status = req.body.status;
    res.json(report);
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(3000, () => {
  console.log('Server pornit pe http://localhost:3000');
});
