require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const rateLimit = require("express-rate-limit");
const { db, init } = require("./db");
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require("./email");

const PORT = process.env.PORT || 3000;
const app = express();

init();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..")));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // max 5 tentativi
  message: { error: 'Troppi tentativi. Riprova tra 15 minuti.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 3, // max 3 email/ora
  message: { error: 'Troppe richieste email. Riprova tra 1 ora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Utility: Validazione password
const validatePassword = (password) => {
  if (password.length < 8) return 'Password minimo 8 caratteri';
  if (!/[A-Z]/.test(password)) return 'Richiede almeno una maiuscola';
  if (!/[a-z]/.test(password)) return 'Richiede almeno una minuscola';
  if (!/[0-9]/.test(password)) return 'Richiede almeno un numero';
  return null; // Valida
};

// Utility: Check account lock
const isAccountLocked = (user) => {
  if (!user.locked_until) return false;
  const lockExpires = new Date(user.locked_until);
  if (lockExpires > new Date()) {
    const minutes = Math.ceil((lockExpires - new Date()) / 60000);
    return { locked: true, minutes };
  }
  // Lock scaduto, resetta
  db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?').run(user.id);
  return false;
};

const getAuthUser = (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  
  // Verifica scadenza token
  const user = db.prepare(
    `SELECT id, full_name AS fullName, email, role, token_expires_at AS tokenExpiresAt 
     FROM users WHERE token = ?`
  ).get(token);
  
  if (!user) return null;
  
  // Check scadenza
  if (user.tokenExpiresAt && new Date(user.tokenExpiresAt) < new Date()) {
    db.prepare('UPDATE users SET token = NULL, token_expires_at = NULL WHERE id = ?').run(user.id);
    return null;
  }
  
  return user;
};

const parseCoords = (raw) => {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, "");
  const [lat, lon] = cleaned.split(",").map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return cleaned;
};

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/register", async (req, res) => {
  const { fullName, email, password, role } = req.body || {};
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Dati mancanti." });
  }
  
  // Validazione password
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  
  const normalizedEmail = String(email).toLowerCase().trim();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (exists) {
    return res.status(409).json({ error: "Email già registrata." });
  }

  const id = nanoid();
  const hash = bcrypt.hashSync(password, 10);
  const token = nanoid();
  const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 giorni
  const userRole = role || "freelancer";
  
  // Token di verifica email (24h)
  const verificationToken = nanoid(32);
  const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  db.prepare(
    `INSERT INTO users (
      id, full_name, email, password_hash, token, token_expires_at, role, 
      created_at, email_verified, verification_token, verification_expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, fullName.trim(), normalizedEmail, hash, token, tokenExpiresAt.toISOString(), 
    userRole, new Date().toISOString(), 0, verificationToken, verificationExpiresAt.toISOString()
  );

  // Invia email di verifica
  try {
    await sendVerificationEmail(normalizedEmail, verificationToken, fullName.trim());
    console.log(`✅ Verification email sent to ${normalizedEmail}`);
  } catch (emailError) {
    console.error('⚠️  Email sending failed:', emailError.message);
    // Non bloccare registrazione se email fallisce
  }

  return res.json({ 
    token, 
    user: { id, fullName, email: normalizedEmail, role: userRole, emailVerified: false },
    message: 'Registrazione completata. Controlla la tua email per verificare l\'account.'
  });
});

app.post("/api/login", authLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Credenziali mancanti." });
  }
  
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = db.prepare(
    `SELECT id, full_name AS fullName, email, role, password_hash AS passwordHash, 
     email_verified AS emailVerified, failed_login_attempts AS failedAttempts, locked_until AS lockedUntil
     FROM users WHERE email = ?`
  ).get(normalizedEmail);
  
  if (!user) {
    return res.status(401).json({ error: "Credenziali non valide." });
  }
  
  // Check account lock
  const lockStatus = isAccountLocked(user);
  if (lockStatus && lockStatus.locked) {
    return res.status(423).json({ 
      error: `Account bloccato. Riprova tra ${lockStatus.minutes} minuti.` 
    });
  }
  
  // Verifica password
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    // Incrementa tentativi falliti
    const newAttempts = (user.failedAttempts || 0) + 1;
    const lockUntil = newAttempts >= 5 
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString() // Lock 15 minuti dopo 5 tentativi
      : null;
    
    db.prepare(
      'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?'
    ).run(newAttempts, lockUntil, user.id);
    
    const remaining = 5 - newAttempts;
    if (remaining > 0) {
      return res.status(401).json({ 
        error: `Credenziali non valide. ${remaining} tentativi rimasti.` 
      });
    } else {
      return res.status(423).json({ 
        error: 'Account bloccato per 15 minuti dopo troppi tentativi.' 
      });
    }
  }
  
  // Login success - resetta tentativi
  const token = nanoid();
  const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 giorni
  const lastLoginAt = new Date().toISOString();
  
  db.prepare(
    `UPDATE users 
     SET token = ?, token_expires_at = ?, last_login_at = ?, 
         failed_login_attempts = 0, locked_until = NULL 
     WHERE id = ?`
  ).run(token, tokenExpiresAt.toISOString(), lastLoginAt, user.id);
  
  return res.json({ 
    token, 
    user: { 
      id: user.id, 
      fullName: user.fullName, 
      email: user.email, 
      role: user.role,
      emailVerified: !!user.emailVerified 
    } 
  });
});

app.post("/api/logout", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Non autenticato." });
  db.prepare("UPDATE users SET token = NULL, token_expires_at = NULL WHERE id = ?").run(user.id);
  return res.json({ ok: true });
});

// Verifica email
app.post("/api/verify-email", async (req, res) => {
  const { token } = req.body || {};
  
  if (!token) {
    return res.status(400).json({ error: 'Token mancante.' });
  }
  
  const user = db.prepare(
    `SELECT id, full_name AS fullName, email, verification_token AS verificationToken, 
     verification_expires_at AS verificationExpiresAt 
     FROM users WHERE verification_token = ?`
  ).get(token);
  
  if (!user) {
    return res.status(404).json({ error: 'Token non valido.' });
  }
  
  // Check scadenza
  if (new Date(user.verificationExpiresAt) < new Date()) {
    return res.status(410).json({ error: 'Token scaduto. Richiedi un nuovo link.' });
  }
  
  // Verifica account
  db.prepare(
    `UPDATE users 
     SET email_verified = 1, verification_token = NULL, verification_expires_at = NULL 
     WHERE id = ?`
  ).run(user.id);
  
  // Invia email di benvenuto
  try {
    await sendWelcomeEmail(user.email, user.fullName);
  } catch (err) {
    console.error('⚠️  Welcome email failed:', err.message);
  }
  
  return res.json({ 
    success: true, 
    message: 'Email verificata con successo! Ora puoi accedere alla piattaforma.' 
  });
});

// Re-invia email di verifica
app.post("/api/resend-verification", emailLimiter, async (req, res) => {
  const { email } = req.body || {};
  
  if (!email) {
    return res.status(400).json({ error: 'Email mancante.' });
  }
  
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = db.prepare(
    'SELECT id, full_name AS fullName, email, email_verified AS emailVerified FROM users WHERE email = ?'
  ).get(normalizedEmail);
  
  if (!user) {
    // Non rivelare che l'email non esiste
    return res.json({ success: true, message: 'Se l\'email è registrata, riceverai un link di verifica.' });
  }
  
  if (user.emailVerified) {
    return res.status(400).json({ error: 'Email già verificata.' });
  }
  
  // Genera nuovo token
  const verificationToken = nanoid(32);
  const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  db.prepare(
    'UPDATE users SET verification_token = ?, verification_expires_at = ? WHERE id = ?'
  ).run(verificationToken, verificationExpiresAt.toISOString(), user.id);
  
  // Invia email
  try {
    await sendVerificationEmail(user.email, verificationToken, user.fullName);
    return res.json({ success: true, message: 'Email di verifica inviata.' });
  } catch (err) {
    console.error('❌ Resend verification failed:', err);
    return res.status(500).json({ error: 'Errore invio email.' });
  }
});

// Richiesta reset password
app.post("/api/forgot-password", emailLimiter, async (req, res) => {
  const { email } = req.body || {};
  
  if (!email) {
    return res.status(400).json({ error: 'Email mancante.' });
  }
  
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = db.prepare(
    'SELECT id, full_name AS fullName, email FROM users WHERE email = ?'
  ).get(normalizedEmail);
  
  // Non rivelare se email esiste o no (security)
  if (!user) {
    return res.json({ 
      success: true, 
      message: 'Se l\'email è registrata, riceverai un link di reset.' 
    });
  }
  
  // Genera reset token (valido 1 ora)
  const resetToken = nanoid(32);
  const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  
  db.prepare(
    'UPDATE users SET reset_token = ?, reset_expires_at = ? WHERE id = ?'
  ).run(resetToken, resetExpiresAt.toISOString(), user.id);
  
  // Invia email
  try {
    await sendPasswordResetEmail(user.email, resetToken, user.fullName);
    return res.json({ 
      success: true, 
      message: 'Se l\'email è registrata, riceverai un link di reset.' 
    });
  } catch (err) {
    console.error('❌ Password reset email failed:', err);
    return res.status(500).json({ error: 'Errore invio email.' });
  }
});

// Reset password con token
app.post("/api/reset-password", authLimiter, (req, res) => {
  const { token, newPassword } = req.body || {};
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Dati mancanti.' });
  }
  
  // Validazione password
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  
  const user = db.prepare(
    `SELECT id, reset_token AS resetToken, reset_expires_at AS resetExpiresAt 
     FROM users WHERE reset_token = ?`
  ).get(token);
  
  if (!user) {
    return res.status(404).json({ error: 'Token non valido.' });
  }
  
  // Check scadenza
  if (new Date(user.resetExpiresAt) < new Date()) {
    return res.status(410).json({ error: 'Token scaduto. Richiedi un nuovo link.' });
  }
  
  // Reset password
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare(
    `UPDATE users 
     SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL, 
         token = NULL, token_expires_at = NULL 
     WHERE id = ?`
  ).run(hash, user.id);
  
  return res.json({ 
    success: true, 
    message: 'Password reimpostata con successo. Ora puoi accedere.' 
  });
});

app.get("/api/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Non autenticato." });
  
  // Fetch full user data including profile fields
  const fullUser = db.prepare(
    "SELECT id, full_name AS fullName, email, role, area, specialization, skills, bio, team_size AS teamSize FROM users WHERE id = ?"
  ).get(user.id);
  
  return res.json({ user: fullUser });
});

app.put("/api/profile", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Non autenticato." });

  const { area, specialization, skills, bio, teamSize } = req.body || {};

  const payload = {
    area: area ? String(area).trim() : null,
    specialization: specialization ? String(specialization).trim() : null,
    skills: skills ? String(skills).trim() : null,
    bio: bio ? String(bio).trim() : null,
    team_size: teamSize ? String(teamSize).trim() : null,
    id: user.id,
  };

  db.prepare(
    `UPDATE users 
     SET area = @area, specialization = @specialization, skills = @skills, bio = @bio, team_size = @team_size
     WHERE id = @id`
  ).run(payload);

  const updated = db
    .prepare("SELECT id, full_name AS fullName, email, area, specialization, skills, bio, team_size AS teamSize FROM users WHERE id = ?")
    .get(user.id);

  return res.json({ user: updated });
});

app.get("/api/listings", (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, work_type AS workType, coords, site_type AS siteType,
       notes, created_at AS createdAt, user_id AS userId
       FROM listings ORDER BY created_at DESC`
    )
    .all();
  res.json({ listings: rows });
});

app.post("/api/listings", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Non autenticato." });

  const { workType, coords, siteType, notes } = req.body || {};
  if (!workType || !coords || !siteType) {
    return res.status(400).json({ error: "Dati mancanti." });
  }

  const parsedCoords = parseCoords(coords);
  if (!parsedCoords) return res.status(400).json({ error: "Coordinate non valide." });

  const id = nanoid();
  const payload = {
    id,
    work_type: String(workType).trim(),
    coords: parsedCoords,
    site_type: String(siteType).trim(),
    notes: notes ? String(notes).trim() : "",
    created_at: new Date().toISOString(),
    user_id: user.id,
  };

  db.prepare(
    `INSERT INTO listings (id, work_type, coords, site_type, notes, created_at, user_id)
     VALUES (@id, @work_type, @coords, @site_type, @notes, @created_at, @user_id)`
  ).run(payload);

  return res.status(201).json({ listing: {
    id: payload.id,
    workType: payload.work_type,
    coords: payload.coords,
    siteType: payload.site_type,
    notes: payload.notes,
    createdAt: payload.created_at,
    userId: payload.user_id,
  } });
});

app.get("/listings.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "listings.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(PORT, () => {
  console.log(`SPLit8 server attivo su http://localhost:${PORT}`);
});
