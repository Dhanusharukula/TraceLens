const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./tracelens.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      endpoint TEXT,
      method TEXT,
      status INTEGER,
      latency INTEGER,
      error TEXT,
      severity TEXT
    )
  `);
});

module.exports = db;
