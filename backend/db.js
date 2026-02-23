const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "split8.db");
const db = new Database(dbPath);

const init = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      token TEXT,
      role TEXT DEFAULT 'freelancer',
      area TEXT,
      specialization TEXT,
      skills TEXT,
      bio TEXT,
      team_size TEXT,
      created_at TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      verification_expires_at TEXT,
      reset_token TEXT,
      reset_expires_at TEXT,
      token_expires_at TEXT,
      last_login_at TEXT,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      work_type TEXT NOT NULL,
      coords TEXT NOT NULL,
      site_type TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const row = db.prepare("SELECT COUNT(*) AS count FROM listings").get();
  if (row.count === 0) {
    const insert = db.prepare(
      `INSERT INTO listings (id, work_type, coords, site_type, notes, created_at, user_id)
       VALUES (@id, @work_type, @coords, @site_type, @notes, @created_at, @user_id)`
    );
    const now = new Date().toISOString();
    insert.run({
      id: "seed-1",
      work_type: "Rilievo architettonico",
      coords: "45.4642, 9.1900",
      site_type: "Residenziale",
      notes: "Accesso con permesso in portineria",
      created_at: now,
      user_id: null,
    });
    insert.run({
      id: "seed-2",
      work_type: "Perizia statica",
      coords: "41.9028, 12.4964",
      site_type: "Storico",
      notes: "Preferibile sopralluogo mattutino",
      created_at: now,
      user_id: null,
    });
    insert.run({
      id: "seed-3",
      work_type: "Stima energetica",
      coords: "45.4384, 10.9916",
      site_type: "Commerciale",
      notes: "Richiesto accesso al tetto",
      created_at: now,
      user_id: null,
    });
  }
};

module.exports = { db, init };
