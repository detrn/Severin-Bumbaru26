const { MongoClient } = require("mongodb");

// Link-ul tau lung care functioneaza
const uri =
  "mongodb://stefanalexandrumirica_db_user:OqpC9XSGMxlVXREU@ac-iauy77e-shard-00-00.9n9xbo8.mongodb.net:27017,ac-iauy77e-shard-00-01.9n9xbo8.mongodb.net:27017,ac-iauy77e-shard-00-02.9n9xbo8.mongodb.net:27017/?ssl=true&replicaSet=atlas-x0qv9u-shard-0&authSource=admin&appName=BDSeverin";

const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("GalatiCity");
    console.log("Conectat la MongoDB Atlas prin database.js!");
    return db;
  } catch (e) {
    console.error("Eroare la conectarea DB in database.js:", e);
    process.exit(1); // Inchide procesul daca nu se poate conecta
  }
}

function getReportsCollection() {
  return db.collection("sesizari");
}

module.exports = { connectDB, getReportsCollection };
