// ===== DEPENDENȚE =====
const { createServer } = require('node:http');
const fs   = require('fs');
const path = require('path');
const { connectDB, getReportsCollection, getUsersCollection, getPropuneriCollection } = require('./database.js');
const { ObjectId } = require('mongodb');
const port = 3000;

let db;
const server = createServer(async (req, res) => {
  // --- Pune ASTA aici (primele linii din funcție) ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  // ------------------------------------------------

  let filePath = req.url.split("?")[0];
  filePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

  // ===== API/PROPUNERI POST =====
  // ===== API/REPORTS POST =====
  if (filePath === "api/reports" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const d = JSON.parse(body);
        const sesizare = {
          autor: d.autor || "Anonim",
          tip: d.tip || "obisnuita",
          categorie: d.categorie || "Altele",
          prioritate: d.prioritate || "Medie",
          titlu: d.titlu || "",
          descriere: d.descriere || "",
          lat: d.lat || null, // ← coordonate salvate
          lng: d.lng || null,
          status: "in asteptare",
          numarVoturi: 0,
          dataCreare: new Date(),
        };
        const collection = getReportsCollection();
        const result = await collection.insertOne(sesizare);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ succes: true, id: result.insertedId }));
      } catch (err) {
        console.error("EROARE api/reports POST:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ succes: false, mesaj: err.message }));
      }
    });
    return;
  }

  // ===== API/SIGNUP =====
  if (filePath === "api/signup" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { email, parola, nume } = JSON.parse(body);
      const usersCol = getUsersCollection();
      const existent = await usersCol.findOne({ email });
      if (existent) {
        res.statusCode = 409;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ succes: false, mesaj: "Email deja înregistrat" }),
        );
        return;
      }
      await usersCol.insertOne({ email, parola, nume });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ succes: true }));
    });
    return;
  }

  // ===== API/LOGIN =====
  if (filePath === "api/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { email, parola } = JSON.parse(body);
      const usersCol = getUsersCollection();
      const user = await usersCol.findOne({ email, parola });
      if (!user) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ succes: false, mesaj: "Email sau parolă greșită" }),
        );
        return;
      }
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          succes: true,
          user: { email: user.email, nume: user.nume },
        }),
      );
    });
    return;
  }

  // ===== API/REPORTS POST =====
  if (filePath === "api/reports" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const sesizareDinFormular = JSON.parse(body);
      const sesizare = {
        nume: sesizareDinFormular.nume,
        prenume: sesizareDinFormular.prenume,
        locatie: sesizareDinFormular.locatie,
        data: sesizareDinFormular.data,
        sesizare: sesizareDinFormular.sesizare,
        criteriuSesizare: sesizareDinFormular.criteriuSesizare,
        cuvinteCheie: sesizareDinFormular.cuvinteCheie || [],
        nivelUrgenta: sesizareDinFormular.nivelUrgenta || 1,
        status: "in asteptare",
        numarVoturi: 0,
        dataCreare: new Date(),
      };
      const collection = getReportsCollection();
      const result = await collection.insertOne(sesizare);
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          succes: true,
          id: result.insertedId,
          mesaj: "Sesizare înregistrată",
        }),
      );
    });
    return;
  }
  ///
  // ===== API/PROPUNERI GET =====
  if (filePath === "api/propuneri" && req.method === "GET") {
    try {
      const col = getPropuneriCollection();
      const docs = await col.find({}).toArray();
      console.log(`[propuneri GET] ${docs.length} documente găsite`); // debug
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(docs));
    } catch (err) {
      console.error("[propuneri GET] EROARE:", err.message);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ succes: false, mesaj: err.message }));
    }
    return;
  }

  // ===== API/PROPUNERI UPVOTE =====
  if (
    filePath.startsWith("api/propuneri/") &&
    filePath.endsWith("/upvote") &&
    req.method === "PUT"
  ) {
    try {
      const id = filePath.split("/")[2];
      const col = getPropuneriCollection();
      await col.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { numarVoturi: 1 } },
      );
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ succes: true }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ succes: false, mesaj: err.message }));
    }
    return;
  }

  // ===== API/PROPUNERI DOWNVOTE =====
  if (
    filePath.startsWith("api/propuneri/") &&
    filePath.endsWith("/downvote") &&
    req.method === "PUT"
  ) {
    try {
      const id = filePath.split("/")[2];
      const col = getPropuneriCollection();
      await col.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { numarVoturi: -1 } },
      );
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ succes: true }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ succes: false, mesaj: err.message }));
    }
    return;
  }

  ///

  // ===== API/REPORTS GET =====
  if (filePath === "api/reports" && req.method === "GET") {
    const colectie = getReportsCollection();
    const docs = await colectie.find({}).toArray();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(docs));
    return;
  }

  // ===== VOTE +1 =====
  if (
    filePath.startsWith("api/reports") &&
    filePath.endsWith("/upvote") &&
    req.method === "PUT"
  ) {
    const id = filePath.split("/")[2];
    const collection = getReportsCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { numarVoturi: 1 } },
    );
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ succes: true, mesaj: "Vot adăugat" }));
    return;
  }

  // ===== VOTE -1 =====
  if (
    filePath.startsWith("api/reports") &&
    filePath.endsWith("/downvote") &&
    req.method === "PUT"
  ) {
    const id = filePath.split("/")[2];
    const collection = getReportsCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { numarVoturi: -1 } },
    );
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ succes: true, mesaj: "Vot eliminat" }));
    return;
  }

  // ===== SERVIRE FIȘIERE STATICE =====
  let fullPath;
  if (filePath === "") {
    fullPath = "../frontend/login.html";
  } else if (filePath.startsWith("assets/")) {
    fullPath = `../${filePath}`;
  } else {
    if (!path.extname(filePath)) filePath = filePath + ".html";
    fullPath = "../frontend/" + filePath;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("Pagina nu a fost găsită");
      return;
    }
    const ext = path.extname(fullPath);
    const types = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".jpg": "image/jpeg",
      ".png": "image/png",
      ".mp4": "video/mp4",
      ".svg": "image/svg+xml",
    };
    res.setHeader("Content-Type", types[ext] || "text/plain");
    res.end(data);
  });
});

// ===== PORNIRE =====
connectDB().then((database) => {
  db = database;
  server.listen(port, () => console.log(`Server pornit pe http://localhost:${port}`));
});
