# SPLit8 - Piattaforma per Sopralluoghi e Lavori Tecnici

Una piattaforma moderna per architetti, studi tecnici e professionisti che consente di gestire sopralluoghi, progetti tecnici e collaborazioni in tempo reale.

## ✨ Funzionalità Implementate

### 🔐 Sistema di Autenticazione Completo
- **Signup**: Registrazione utenti con validazione email e password
- **Login**: Accesso sicuro con token JWT-like
- **Profilo**: Completamento profilo professionale durante onboarding
- **Session Management**: Persistenza dati via localStorage
- **Role-based Dashboard**: Dashboard personalizzato per studio vs freelancer

#### Dashboard Differenziati per Ruolo

**Dashboard Freelancer:**
- KPI: Progetti attivi, Candidature inviate, Compenso mensile
- Funzioni: Candidature, Profilo Pubblico, Miei Progetti, Tariffe, Valutazioni
- Focus: Gestione personale lavori e visibilità

**Dashboard Studio:**
- KPI: Inserzioni attive, Team members, Candidature ricevute
- Funzioni: Gestione Team, Progetti Attivi, Report Mensili, Analisi Dati, Messaggistica Team, Impostazioni
- Focus: Coordinamento team e gestione clienti

### 📝 Pagine Principali
1. **index.html** - Landing page con hero, stats, "Come funziona", features, testimonials, footer
2. **signup.html** - Pagina di registrazione con form validato
3. **onboarding.html** - Completamento profilo post-signup
4. **listings.html** - Crea e visualizza inserzioni con mappa Leaflet
5. **search.html** - Ricerca e filtri avanzati
6. **listing.html** - Dettaglio inserzione singola
7. **companies.html** - Showcase aziende partner
8. **dashboard.html** - KPI e statistiche utente
9. **profile.html** - Editor profilo utente
10. **messages.html** - Sistema messaggistica
11. **favorites.html** - Inserzioni salvate
12. **applications.html** - Tracking candidature
13. **pricing.html** - Piani tariffari
14. **faq.html** - Domande frequenti
15. **contact.html** - Form contatti

### 🎨 Design System
- **Tema**: Dark mode (--bg: #1b1c1f, --accent: #86c5ff)
- **Icone**: SVG inline professionali (no emoji)
- **Animazioni**: Canvas 2D con skyline futuristica, drones, stelle, grid
- **Responsive**: Mobile-first con breakpoint a 900px
- **Componenti**: Cards, buttons, forms, modals, tabs, pills, grids

### 🗺️ Geolocalizzazione
- Integrazione Leaflet.js con OpenStreetMap
- Marcatori dinamici per inserzioni
- Sincronizzazione mappa/lista in tempo reale
- Validazione coordinate (lat -90/90, lon -180/180)

### 🔧 Backend API (Node.js + Express)
**Endpoints Implementati:**
- `POST /api/register` - Registrazione utente
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Dati utente corrente
- `PUT /api/profile` - Aggiornamento profilo (NEW)
- `GET /api/listings` - Elenco inserzioni
- `POST /api/listings` - Crea inserzione
- `GET /api/health` - Health check

### 💾 Database (SQLite)
**Tabella Users:**
- id, full_name, email, password_hash
- token (per sessioni), area, specialization, skills, bio, team_size
- created_at

**Tabella Listings:**
- id, work_type, coords, site_type, notes
- created_at, user_id (FK)

## 🚀 Avvio Rapido

### Backend
```bash
cd backend
npm install
npm start
# Server su http://localhost:3000
```

### Frontend
Apri il browser:
```
http://localhost:3000
```

## 📋 Flusso Utente Completo

1. **Signup** (signup.html)
   - Nome, email, password, ruolo
   - Validazione 8+ caratteri password
   - Redirect → onboarding.html

2. **Onboarding** (onboarding.html)
   - Area geografica, specializzazione, skills, bio, team size
   - Salva profilo via `/api/profile` PUT
   - Redirect → dashboard.html

3. **Dashboard** (dashboard.html)
   - KPI card (inserzioni, candidature, messaggi)
   - Activity feed

4. **Operazioni** (listings.html)
   - Crea inserzione geolocalizzata
   - Visualizza mappa con tutti i progetti
   - Filtra per tipo di lavoro e sito

5. **Esplorazione** (search.html)
   - Ricerca con filtri avanzati
   - Location, job type, date range

## 🔐 Sicurezza
- Password hasate con bcryptjs (salt 10)
- Token nanoid per sessioni
- CORS abilitato
- Validazione lato server

## 📱 Sezioni Homepage
- **Hero Section**: CTA principale, stats
- **Come funziona**: 3 step (Iscrizione, Sfoglia, Collabora)
- **Features**: 6 card con icone ed emoji
- **Testimonials**: 3 testimonial da studi tecnici
- **Final CTA**: "Pronto a iniziare?"
- **Footer**: Link, colonne info, social, copyright

## 🎯 Prossimi Passi
- [ ] Integrazione pagamenti (per pricing tiers)
- [ ] Sistema messaggistica real-time (Socket.io)
- [ ] Notifiche email
- [ ] Clustering candidature
- [ ] Sistema rating/review
- [ ] Advanced search con filtri backend
- [ ] Admin panel

## 📐 Architettura
```
SPLit8/
├── index.html          (Landing page)
├── signup.html         (Registration)
├── onboarding.html     (Profile completion)
├── listings.html       (Main operations)
├── search.html         (Search/filter)
├── listing.html        (Single detail)
├── companies.html      (Partners)
├── dashboard.html      (User KPI)
├── profile.html        (User editor)
├── messages.html       (Chat)
├── favorites.html      (Saved listings)
├── applications.html   (Tracking)
├── pricing.html        (Plans)
├── faq.html            (Help)
├── contact.html        (Contact)
├── script.js           (Shared logic)
├── styles.css          (Design system)
├── package.json        (Node deps)
└── backend/
    ├── server.js       (Express API)
    ├── db.js           (SQLite init)
    └── split8.db       (Database)
```

## 🛠️ Stack Tecnologico
- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Auth**: bcryptjs, nanoid
- **Maps**: Leaflet.js, OpenStreetMap
- **UI**: Custom CSS, no framework

## 💡 Highlights Tecnici
- Canvas animation con perspective 3D
- Modular state management via localStorage + apiRequest()
- Responsive grid layouts
- Form validation (client + server)
- Auth guards per pagine protette
- Error handling centralizzato
- CSS variables per theming

---

**Versione**: 1.0.0  
**Data**: Dicembre 2024  
**Sviluppatore**: AI Assistant
