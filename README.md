# Belvo — Official Agency Website

> Full-stack website for **BELVO**, a premium full-service creative agency based in Goregaon, Mumbai.
> Live at [belvo.buzz](https://belvo.buzz)

---

## What's Inside

This is a single monorepo that ships a public marketing site, an AI chatbot, a tools marketplace, an intern onboarding portal, an admin dashboard, and a full client project portal — all in one Vite + React + Express codebase deployed on Vercel.

| Surface | Path | Description |
|---|---|---|
| Public site | `/` | Home, Services, Works, Blog, Events, Careers, Team |
| AI Chatbot | everywhere | Groq/Gemini-powered widget, static fallback if no key |
| Tools | `/tools` | Buy shared SaaS subscriptions (Canva, Adobe CC, etc.) |
| Events | `/events` | Register for webinars and workshops |
| Intern Portal | `/intern` | Onboarding flow — OTP auth → checklist → HR notifications |
| Admin Dashboard | `/admin` | Manage team members and departments via MongoDB |
| Client Portal | `/client` | Per-client workspace — projects, milestones, payments, docs |
| LMS / Notes | `/lms`, `/notes-pdfs` | PDF notes library and video resources |

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript 5** via **Vite 7**
- **Tailwind CSS v4** for styling
- **Wouter** for client-side routing
- **Framer Motion** for page transitions and animations
- **shadcn/ui** (Radix UI primitives) for accessible components
- **TanStack Query v5** for server state
- **React Hook Form + Zod** for forms and validation
- **Three.js**, **Recharts**, **Embla Carousel** for richer UI pieces

### Backend
- **Express.js** (ESM) running on Node.js
- **MongoDB** via the `mongodb` driver with lazy-init connection pooling
- **JWT** (`jsonwebtoken`) + **bcryptjs** for auth
- **Nodemailer** over Gmail SMTP for transactional email
- **Multer** for image uploads (5 MB cap, JPEG/PNG/WebP/GIF)
- **Helmet** + **express-rate-limit** for hardening
- **Groq** (`llama-3.1-8b-instant`) and **Google Gemini** (`gemini-2.0-flash`) for the chatbot

### Deployment
- **Vercel** — serverless functions in `api/`, static SPA from `dist/`
- Dev proxy: Vite forwards `/api` and `/admin` to `localhost:3001`

---

## Project Structure

```
Belvo/
├── api/                        # Vercel serverless entry points
│   ├── index                   # Main Express app — all routes live here
│   ├── ask                     # POST /api/ask — AI chatbot (Groq → Gemini fallback)
│   ├── register                # POST /api/register — event registration
│   └── [...catchAll]           # Vercel catch-all → re-exports api/index
│
├── server/                     # Local dev Express server (mirrors api/index)
│   ├── index                   # Entry point — loads .env, starts on :3001
│   ├── db                      # MongoDB lazy-init (getDb, isDbReady)
│   ├── middleware/auth          # authenticateToken, JWT helpers, rate limiters
│   ├── data/tools               # SaaS tools catalog with INR pricing
│   ├── env.example             # All required environment variables
│   └── schema                  # Reference schema
│
├── src/                        # React frontend
│   ├── App                     # Root router — branches public / admin / intern / client
│   ├── main                    # React entry point
│   ├── pages/                  # Page components
│   │   ├── admin/              # Admin login + dashboard
│   │   └── intern/             # Intern login + dashboard
│   ├── app/client/             # Client portal pages + sidebar layout
│   ├── components/             # Navbar, ChatBot, CursorFollower, GrainOverlay, etc.
│   ├── sections/               # Page sections (About, etc.)
│   ├── contexts/               # ThemeContext, TeamProvider
│   ├── lib/                    # admin-api, intern-auth, team-store, utils
│   └── types/                  # TypeScript type definitions
│
├── public/                     # Static assets — logos, blog covers, images
├── Notes/                      # Standalone PDF notes sub-app (separate Vite project)
├── index                       # Root HTML shell
├── vite.config                 # Vite config — proxy, @/ alias, build settings
├── vercel                      # Vercel rewrites
└── package
```

---

## API Reference

### Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/admin/login` | — | Admin username/password → JWT |
| `POST` | `/intern/send-otp` | — | Send 6-digit OTP to whitelisted email |
| `POST` | `/intern/verify-otp` | — | Verify OTP → intern JWT |
| `POST` | `/api/auth/login` | — | Client login → httpOnly session cookie |
| `POST` | `/api/auth/signup` | — | Client signup |
| `GET` | `/api/auth/me` | Cookie | Get current client session |
| `POST` | `/api/auth/logout` | Cookie | Clear session cookie |

### Team & Departments (Admin-protected)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/team` | List all team members |
| `POST` | `/api/team` | Create a team member |
| `PUT` | `/api/team/:id` | Update a team member |
| `DELETE` | `/api/team/:id` | Delete a team member |
| `GET` | `/api/departments` | List all departments |
| `POST` | `/api/departments` | Create a department |
| `PUT` | `/api/departments/:id` | Update a department |
| `DELETE` | `/api/departments/:id` | Delete a department (blocked if members exist) |

### Intern Portal
| Method | Path | Description |
|---|---|---|
| `POST` | `/intern/submit-offer-letter` | Request offer letter → email to HR |
| `POST` | `/intern/submit-id-card` | Request ID card with photo → email to HR |
| `POST` | `/intern/submit-nda` | Submit signed NDA PDF → email to HR |
| `POST` | `/intern/mark-checklist` | Toggle LMS/offer letter/ID card status |
| `POST` | `/intern/mark-social` | Mark Instagram/LinkedIn/WhatsApp as done |
| `GET` | `/intern/checklist-status` | Get onboarding checklist state |
| `POST` | `/intern/submit-onboarding` | Send completion summary to HR |

### Tools, Events & Utilities
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tools-register` | Register interest in a SaaS tool |
| `POST` | `/api/register` | Event registration (saves to DB + email notification) |
| `POST` | `/api/ask` | AI chatbot query (Groq primary, Gemini fallback) |
| `POST` | `/api/upload` | Upload a team member image (admin-protected, 5 MB max) |
| `GET` | `/api/health` | DB health check |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** instance (Atlas free tier works)
- A **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) for SMTP

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in the values:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
MONGODB_DB=belvo

# Admin portal
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret

# Client portal
AUTH_SECRET=your-auth-secret

# Email (Gmail SMTP)
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
HR_EMAIL=hr@yourdomain.com

# Intern portal
ALLOWED_INTERN_EMAIL=intern@example.com

# AI chatbot (optional — chatbot falls back to static answers if unset)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
AI_PROVIDER=groq   # "groq" (default) or "gemini"
```

### 3. Run locally

```bash
# Terminal 1 — backend API on :3001
node server/index.js

# Terminal 2 — Vite dev server on :5173 (proxies /api and /admin to :3001)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`.

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Set all environment variables in **Project → Settings → Environment Variables**.
3. Vercel auto-detects the `api/` directory and deploys each file as a serverless function.
4. The `vercel.json` rewrites handle SPA fallback and API routing — no extra config needed.

---

## Tools Marketplace

The `/tools` page lets visitors register interest in shared SaaS subscriptions managed by Belvo. Registrations are saved to the `tool_orders` MongoDB collection for fulfilment tracking.

| Tool | Plans |
|---|---|
| Canva Pro | 2 Months / 1 Year / 4 Years / Lifetime |
| Adobe Creative Cloud | Standard |
| ChatGPT Plus | Monthly |
| Claude (ClickUp) | Monthly |
| Netflix Shared | Monthly |
| Coursera Plus | 1 Year |
| Gemini AI | 1 Year |
| Amazon Prime | 1 Year |
| YouTube Premium | Monthly |

All prices are in INR.

---

## AI Chatbot

The chatbot widget (`/api/ask`) answers questions about BELVO using a hard-coded system prompt. It tries **Groq** first and falls back to **Gemini** if Groq fails. If neither key is configured the frontend silently falls back to pre-written static answers — no broken states.

---

## Client Portal

The `/client` portal gives each agency client a dedicated workspace:

- **Dashboard** — project overview and activity summary
- **Projects** — all active and past projects
- **Milestones** — delivery checkpoints and sign-offs
- **Verification** — approve deliverables
- **Timeline** — Gantt-style project timeline
- **Meetings** — scheduled calls and agendas
- **Payments** — invoices and payment history
- **Documents** — shared files and contracts
- **Chat** — direct messaging with the team
- **Change Requests** — track scope changes
- **Reports** — analytics and performance reports
- **Settings** — account preferences

Auth uses an httpOnly `belvo_session` cookie (7-day JWT), verified on every API call.

---

## Contact

**BELVO Creative Agency**
Goregaon, Mumbai, Maharashtra

- Email: contact.belvo@gmail.com
- Phone: +91 89284 66820
- Instagram: [@belvo_official](https://instagram.com/belvo_official)
- LinkedIn: [belvo.buzz](https://belvo.buzz)
#   B e l v o 
 
 