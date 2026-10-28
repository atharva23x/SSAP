# 🎓 Smart Student Assistance Portal (SSAP)

> **One Portal. Every Scholarship, Exam & Opportunity.**
> An AI-powered, multilingual government-assistance platform for Indian students — scholarships, entrance exams, document guides, nearby citizen offices and an AI assistant, all in your language.

Made for Bharat 🇮🇳 · Mobile-first · WCAG AA · 7 languages · Deployable to Vercel + Render + MongoDB Atlas.

---

## ✨ Features

| Area | What it does |
|------|--------------|
| **Eligibility Engine** | Scores every scheme against a student's age, category, class, income & state → Eligible / Action Needed / Not Eligible with a match % and per-criterion ✅/❌. |
| **Document Gap Detector** | Compares a scheme's required docs with what the student has uploaded and flags exactly what's missing + a step-by-step guide (office, fee, timeline). |
| **Nearby Offices Map** | Leaflet map of 150 government offices (Tehsildar / CSC / Setu / e-Seva / collectorate) with "Use my location" geolocation and Google Maps directions. |
| **Scheme Catalogue (1,000+)** | 1,067 real, verifiable schemes — 50 central (NSP/AICTE/UGC/DST/ministries), 993 state/UT programs across all 36 states & union territories, 11 education-loan schemes (PM-Vidyalaxmi, CSIS, CGFSEL, Vidya Lakshmi) and 12 private/CSR scholarships — each linked to its official portal (NSP, myScheme, MahaDBT, UP Scholarship…). |
| **Exams & Roadmaps** | 68 real exams — JEE/NEET/CUET/UPSC/SSC/CAT/banking/defence plus state CETs and olympiads — with phase-wise timelines, free resources (SATHEE/NPTEL/NCERT/DIKSHA/SWAYAM), books, mock tests and ICS calendar export. |
| **Competitions** | 30 hackathons & olympiads (Smart India Hackathon, TCS CodeVita, Flipkart GRiD, HBCSE INOs, ISRO YUVIKA, e-Yantra) with deadlines, prizes and registration links. |
| **Study Material** | 140 curated free resources from NCERT, DIKSHA, SWAYAM, NPTEL, SATHEE and Virtual Labs — notes, videos, previous-year papers and mocks in 7 languages. |
| **Document Guides** | 10 step-by-step guides (income, caste, domicile, non-creamy layer, UDID disability, minority, caste validity…) with office type, fees and timelines. |
| **AI Assistant** | Rule-based engine with **20 intents** that answers in the user's language and returns a 3-step roadmap. Optional OpenAI/Gemini fallback. |
| **Multilingual (i18n)** | 7 languages — English, हिंदी, मराठी, தமிழ், తెలుగు, বাংলা, ગુજરાતી — with 100% UI string coverage and Noto font auto-switching. |
| **Notifications** | `node-cron` generates deadline alerts 7/3/1 days before, in-app + optional email (Nodemailer). |
| **Admin Panel** | CRUD for schemes/exams/competitions/materials/offices/guides, user table, stats dashboard, doc verification. |

---

## 🧱 Tech Stack

- **Backend:** Node.js, Express, Mongoose, JWT (httpOnly cookie + refresh), bcryptjs, express-validator, helmet, express-rate-limit, node-cron, multer.
- **Frontend:** Static SPA — HTML5 + Tailwind (Play CDN) + Lucide icons + Leaflet + Vanilla JS (ES modules, hash router). No build step required.
- **Database:** MongoDB (Atlas or local), 2dsphere geospatial index on offices.
- **i18n:** JSON bundles served from the API (`/api/i18n/:lang`), single source of truth.

```
smart-student-portal/
├── backend/               Express API
│   ├── src/
│   │   ├── config/        env, db
│   │   ├── models/        User, Scheme, Exam, Competition, StudyMaterial, Office,
│   │   │                  Notification, AiQuery, DocumentGuide, RefreshToken
│   │   ├── controllers/   auth, scheme, academic, office, document, ai,
│   │   │                  notification, profile, admin
│   │   ├── routes/        auth, schemes, academic, offices, documents, ai, ...
│   │   ├── middleware/    auth, validate, rateLimit, i18n, upload, error
│   │   ├── utils/         eligibility engine, aiEngine, jwt, localize, mailer
│   │   ├── cron/          deadline reminders
│   │   ├── locales/       en, hi, mr, ta, te, bn, gu  (327 keys each)
│   │   └── seed/          seed.js (demo data)
│   └── tests/             auth + eligibility (Jest + Supertest + mongodb-memory-server)
├── frontend/              Static SPA
│   ├── index.html
│   ├── css/styles.css     design system
│   └── js/                app, router, api, i18n, store, ui + pages/
├── docs/api.json          Postman collection
├── scripts/check-locales.js
├── render.yaml            backend deploy blueprint
└── .github/workflows/ci.yml
```

---

## 🚀 Quick Start (local)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas URI

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env          # edit MONGO_URI, JWT secrets
npm run seed:reset            # (re)create demo data
npm run dev                   # http://localhost:5000
```

### 2. Frontend
The frontend is a static site — serve it with any static server:
```bash
cd frontend
npx serve .                   # http://localhost:3000
```
By default it calls the API at `http://localhost:5000`. To point elsewhere:
- open with `?api=https://your-api.onrender.com`, or
- set `window.__API_URL__` before the app loads, or
- set `localStorage.setItem('ssap_api', url)`.

### 3. Demo logins
| Role | Email | Password |
|------|-------|----------|
| Student | `demo@student.in` | `demo123` |
| Admin | `admin@ssap.in` | `admin123` |

---

## ✅ Tests

```bash
cd backend
npm test
```
Runs Jest + Supertest against an in-memory MongoDB (`mongodb-memory-server`). Covers the **auth flow** (register/login/me/validation) and the **eligibility engine + document gap detector**.

## 🌍 i18n guard
```bash
node scripts/check-locales.js
```
Fails CI if any locale drifts from `en.json`.

---

## 🔌 API Overview

Base URL: `http://localhost:5000/api` · Full collection in [`docs/api.json`](docs/api.json).

| Method | Endpoint | Auth | Description |
|-------|----------|------|-------------|
| POST | `/auth/register` | – | Create account (sets cookies) |
| POST | `/auth/login` | – | Log in |
| POST | `/auth/refresh` | cookie | Rotate tokens |
| GET | `/auth/me` | ✔ | Current user |
| GET | `/i18n/:lang` | – | UI string bundle |
| GET | `/schemes` | ✔ | List/filter schemes |
| GET | `/schemes/match` | ✔ | **Eligibility engine** |
| GET | `/schemes/:id` | ✔ | Scheme + checks |
| POST | `/schemes/:id/save` | ✔ | Toggle bookmark |
| GET | `/exams` `· /competitions` `· /materials` | ✔ | Academic content |
| GET | `/offices/nearby` | ✔ | Geo query (`lat`,`lng`,`radius`) |
| GET | `/documents/gap` | ✔ | Missing docs for a scheme |
| GET | `/documents/guide/:docType` | ✔ | Step-by-step guide |
| POST | `/ai/query` | ✔ | AI assistant |
| GET | `/notifications` | ✔ | Inbox |
| PATCH | `/notifications/:id/read` | ✔ | Mark read |
| PUT | `/profile` | ✔ | Update profile |
| POST | `/profile/documents` | ✔ | Upload doc (multipart ≤5MB) |
| GET/POST/PUT/DELETE | `/admin/*` | admin | CRUD + stats + users |

> Auth uses **httpOnly cookies** (recommended). A JWT is also returned so tools like Postman can use `Authorization: Bearer <token>`.

---

## ☁️ Deployment

### Database — MongoDB Atlas
1. Create a free M0 cluster → **Database Access**: add a user → **Network Access**: allow `0.0.0.0/0` (or your Render IPs).
2. Copy the connection string into `MONGO_URI`.

### Backend — Render (or Railway)
1. Push this repo to GitHub.
2. Render → **New → Blueprint** → select the repo (uses `render.yaml`).
3. Set env vars: `MONGO_URI`, `CORS_ORIGIN` (your frontend URL). `JWT_*` are auto-generated.
4. Deploy. Health check: `https://<your-api>/api/health`.

*Equivalent Railway/other host:* run `npm start` from `backend/`, set the same env vars.

### Frontend — Vercel
1. Deploy the `frontend/` folder as a static project (`frontend/vercel.json` handles SPA rewrites).
2. Point the app at your API: set the API base via `?api=` or `localStorage.ssap_api`, or bake `window.__API_URL__` into `index.html`.
3. Set the backend `CORS_ORIGIN` to your Vercel URL and `COOKIE_SECURE=true`.

### Single-service option
The backend serves `frontend/dist` automatically if present — build/copy the frontend there and deploy one Render service for everything.

---

## ♿ Accessibility & Responsive
- Semantic landmarks, skip-link, focus-visible rings, ARIA labels on icon buttons, `aria-live` on chat/toasts.
- 8px grid, 360px → 1440px responsive, mobile bottom-nav + drawer, `prefers-reduced-motion` support.
- Contrast checked against WCAG AA for text/background pairs.

## 🔐 Security
- bcrypt password hashing, JWT access (15m) + rotating refresh (30d, DB-backed with TTL), httpOnly cookies.
- `helmet`, `cors` allow-list, `express-mongo-sanitize`, rate-limiting (global + 5/min on auth + 20/min on AI), `express-validator` on all input, 5MB upload cap with type allow-list.

---

## 📄 License
MIT — built to help every Indian student find the support they deserve. ❤️
