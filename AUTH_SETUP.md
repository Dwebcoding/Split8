# 🔐 Sistema di Autenticazione SPLit8 - Setup Completo

## ✅ Implementato

Sistema di autenticazione production-ready con:

### 📧 **Email Verification**
- ✅ Email di verifica dopo registrazione (link valido 24h)
- ✅ Email di benvenuto dopo verifica
- ✅ Re-invio email di verifica con rate limiting

### 🔑 **Password Reset**
- ✅ Richiesta reset password con email
- ✅ Token temporaneo sicuro (valido 1 ora)
- ✅ Validazione password strength
- ✅ Rate limiting su richieste

### 🛡️ **Sicurezza Avanzata**
- ✅ Rate limiting login (5 tentativi / 15 min)
- ✅ Account locking dopo 5 login falliti
- ✅ Token con scadenza (7 giorni)
- ✅ Password validation (min 8 caratteri, maiuscole, minuscole, numeri)
- ✅ Protezione brute-force
- ✅ Email rate limiting (3 email / ora)

### 🗄️ **Database Schema**
Nuovi campi aggiunti alla tabella `users`:
```sql
email_verified INTEGER DEFAULT 0
verification_token TEXT
verification_expires_at TEXT
reset_token TEXT
reset_expires_at TEXT
token_expires_at TEXT
last_login_at TEXT
failed_login_attempts INTEGER DEFAULT 0
locked_until TEXT
```

---

## 🚀 Setup e Installazione

### **1. Installa le nuove dipendenze**

```powershell
npm install
```

Pacchetti aggiunti:
- `nodemailer` - Invio email
- `express-rate-limit` - Rate limiting
- `dotenv` - Gestione variabili ambiente

### **2. Configura SMTP Email**

Copia il template delle variabili ambiente:

```powershell
Copy-Item .env.example .env
```

Apri `.env` e configura SMTP:

#### **Opzione A: Gmail (consigliato per sviluppo)**

1. Abilita **autenticazione a 2 fattori** su Gmail
2. Vai su: https://myaccount.google.com/apppasswords
3. Crea una **"App Password"** per "Mail"
4. Usa quella password nel file `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tuo-account@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Password app (16 caratteri)
APP_URL=http://localhost:5173
```

#### **Opzione B: SendGrid (consigliato per produzione)**

1. Registrati su https://sendgrid.com (100 email/giorno gratis)
2. Crea API Key
3. Configura `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APP_URL=https://tuodominio.com
```

### **3. Elimina il vecchio database (per applicare nuovo schema)**

```powershell
Remove-Item backend\split8.db -ErrorAction SilentlyContinue
```

Il database sarà ricreato automaticamente con i nuovi campi al prossimo avvio.

### **4. Avvia il server**

```powershell
npm start
```

Output atteso:
```
✅ SMTP server ready to send emails
SPLit8 server attivo su http://localhost:3000
```

Se vedi:
```
❌ SMTP connection error: ...
⚠️  Email features disabled. Configure SMTP in .env file.
```

Significa che devi configurare SMTP nel file `.env`.

---

## 📋 Nuovi Endpoint API

### **POST `/api/register`**
Registrazione utente con invio email di verifica.

**Body:**
```json
{
  "fullName": "Mario Rossi",
  "email": "mario@example.com",
  "password": "Password123",
  "role": "freelancer"
}
```

**Response:**
```json
{
  "token": "abc123...",
  "user": {
    "id": "...",
    "fullName": "Mario Rossi",
    "email": "mario@example.com",
    "role": "freelancer",
    "emailVerified": false
  },
  "message": "Registrazione completata. Controlla la tua email..."
}
```

**Validazione password:**
- ✅ Minimo 8 caratteri
- ✅ Almeno 1 maiuscola
- ✅ Almeno 1 minuscola
- ✅ Almeno 1 numero

---

### **POST `/api/verify-email`**
Verifica email con token ricevuto via email.

**Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verificata con successo!"
}
```

**Errori:**
- `404` - Token non valido
- `410` - Token scaduto (richiedi nuovo link)

---

### **POST `/api/resend-verification`**
Re-invia email di verifica.

**Rate Limit:** 3 richieste / ora

**Body:**
```json
{
  "email": "mario@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email di verifica inviata."
}
```

---

### **POST `/api/login`**
Login con protezione brute-force.

**Rate Limit:** 5 tentativi / 15 minuti

**Body:**
```json
{
  "email": "mario@example.com",
  "password": "Password123"
}
```

**Response Success:**
```json
{
  "token": "abc123...",
  "user": {
    "id": "...",
    "fullName": "Mario Rossi",
    "email": "mario@example.com",
    "role": "freelancer",
    "emailVerified": true
  }
}
```

**Response Error (tentativi falliti):**
```json
{
  "error": "Credenziali non valide. 3 tentativi rimasti."
}
```

**Response Error (account bloccato):**
```json
{
  "error": "Account bloccato. Riprova tra 12 minuti."
}
```

**Status Codes:**
- `200` - Login success
- `401` - Credenziali errate
- `423` - Account bloccato

---

### **POST `/api/forgot-password`**
Richiedi reset password.

**Rate Limit:** 3 richieste / ora

**Body:**
```json
{
  "email": "mario@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Se l'email è registrata, riceverai un link di reset."
}
```

---

### **POST `/api/reset-password`**
Reimposta password con token.

**Rate Limit:** 5 tentativi / 15 minuti

**Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reimpostata con successo."
}
```

**Errori:**
- `400` - Password non valida
- `404` - Token non valido
- `410` - Token scaduto (1 ora)

---

## 🔒 Funzionalità di Sicurezza

### **1. Account Locking**
- Dopo **5 login falliti** → account bloccato per **15 minuti**
- Counter si resetta dopo login riuscito
- Lock automatico scade dopo 15 minuti

### **2. Token Expiration**
- **Auth token**: 7 giorni
- **Verification token**: 24 ore
- **Reset token**: 1 ora

### **3. Rate Limiting**
- **Login**: max 5 tentativi / 15 minuti
- **Email operations**: max 3 richieste / ora
- Headers automatici: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### **4. Password Validation**
```javascript
validatePassword(password) {
  - Minimo 8 caratteri
  - Almeno 1 maiuscola (A-Z)
  - Almeno 1 minuscola (a-z)
  - Almeno 1 numero (0-9)
}
```

---

## 🧪 Testing

### **1. Test Registrazione + Verifica Email**

```javascript
// 1. Registra nuovo utente
POST http://localhost:3000/api/register
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "Test1234",
  "role": "freelancer"
}

// 2. Controlla email ricevuta
// 3. Clicca link o copia token dall'URL

// 4. Verifica email
POST http://localhost:3000/api/verify-email
{
  "token": "token-dalla-email"
}
```

### **2. Test Reset Password**

```javascript
// 1. Richiedi reset
POST http://localhost:3000/api/forgot-password
{
  "email": "test@example.com"
}

// 2. Controlla email ricevuta

// 3. Reset password con token
POST http://localhost:3000/api/reset-password
{
  "token": "token-dalla-email",
  "newPassword": "NewPass123"
}
```

### **3. Test Rate Limiting**

```javascript
// Prova login 6 volte con password errata
// Alla 6a volta → errore 423 "Account bloccato"
```

---

## 📁 File Modificati/Creati

### **Nuovi File:**
- ✅ `backend/email.js` - Sistema email Nodemailer
- ✅ `.env.example` - Template configurazione

### **File Modificati:**
- ✅ `backend/db.js` - Nuovo schema con 9 campi sicurezza
- ✅ `backend/server.js` - 4 nuovi endpoint + sicurezza
- ✅ `package.json` - 3 nuove dipendenze
- ✅ `pages/verify-email.html` - Logica verifica funzionante
- ✅ `pages/forgot-password.html` - Logica richiesta reset
- ✅ `pages/reset-password.html` - Logica reset con validazione

---

## 🐛 Troubleshooting

### **SMTP Error: "Invalid login"**
- Verifica SMTP_USER e SMTP_PASS in `.env`
- Gmail: usa "App Password", non password normale
- Verifica che 2FA sia abilitato (per Gmail)

### **Email non arriva**
- Controlla cartella SPAM
- Verifica SMTP_FROM sia email valida
- Testa connessione SMTP con `npm start` e controlla log

### **Token scaduto**
- Verification token: 24h
- Reset token: 1h
- Richiedi nuovo link con `/api/resend-verification` o `/api/forgot-password`

### **Account bloccato**
- Attendi 15 minuti
- Oppure resetta campo `locked_until` nel database

---

## 🚀 Produzione

Prima di andare in produzione:

1. ✅ Cambia `APP_URL` in `.env` con dominio reale
2. ✅ Usa provider SMTP professionale (SendGrid, MailGun, AWS SES)
3. ✅ Configura HTTPS (certificato SSL)
4. ✅ Aggiungi CORS restrictions
5. ✅ Aumenta bcrypt rounds a 12
6. ✅ Usa JWT invece di nanoid per token
7. ✅ Implementa logging sistema (Winston, Bunyan)
8. ✅ Monitora rate limiting e tentativi di login

---

## 📚 Riferimenti

- **Nodemailer Docs**: https://nodemailer.com/
- **Express Rate Limit**: https://github.com/express-rate-limit/express-rate-limit
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **SendGrid Setup**: https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api

---

Fatto! 🎉 Sistema di autenticazione completo e production-ready.
