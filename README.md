# ApplyTrack AI 🚀 

An AI-powered job application command center and MERN + TypeScript platform.

ApplyTrack AI goes beyond standard CRUD application tracking by offering automatic email classification, follow-up email generation, corporate health and layoff-risk predictors, interview success probability scoring, and salary negotiation advisory.

---

## 🌟 Key Features

* **Essential Tracker (Layer 1):** Full pipeline CRUD, timeline event auditing, status badges (`SAVED` to `GHOSTED`), contacts directory, and search filters.
* **Kanban Drag-and-Drop:** Visual Kanban stage manager built with `@dnd-kit` and toggleable Table views.
* **Email Sync & Parser (Layer 2):** Parses recruiter messages, extracts job details, and flags changes for user review (*"Review before Confirm"* model).
* **Inactivity Scanner ("Lost Applications"):** Background daemon scanning applications with 10+ days of inactivity and auto-scheduling follow-up reminders.
* **AI Follow-Up Assistant (Layer 3):** Drafts recruiter emails in selectable tones (*Professional, Friendly, Concise, Confident*).
* **Interview Probability & Study Prep:** Scores job profile alignment (0-100%) and provides top 5 likely technical/behavioral questions with study topics.
* **Company Health & Layoff Risk:** Evaluates hiring trends, size, and corporate stability parameters.
* **Salary Negotiation Advisor:** Benchmarks offers against regional market rates, builds leverage points, and composes counter-proposal pitches.
* **Job Match Score:** Compares raw job postings against stored candidate skills, flagging missing stack credentials (*e.g., Docker, AWS, Redis*).
* **Analytics & Funnel:** Visual conversion rates, weekly application volume, company size response rates, and source efficiency metrics.
* **Instant Demo Account Access:** Pre-seeds database for **Guest** with **42 applications**, **17 active pipelines**, **8 interviews**, **2 offers**, **13 rejections**, and **7 ghosted** entries out-of-the-box.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, DaisyUI, Recharts, `@dnd-kit`, TanStack React Query, Axios, Lucide React.
* **Backend:** Node.js, Express.js, TypeScript (`tsx`), MongoDB, Mongoose, JWT, bcryptjs, Zod, Nodemailer, node-cron.
* **AI Provider:** Google Gemini API (`@google/generative-ai`) with fallback Simulator Engine.
* **Theme:** Professional Charcoal, Slate, Amber, and Gold Palette (No blue/purple/pink).

---

## 📁 Repository Directory Structure

```text
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Layout & Shared UI Components (.tsx)
│   │   ├── context/            # AuthContext & Session Provider (.tsx)
│   │   ├── pages/              # Dashboard, Applications, Details, Calendar, Analytics, AI Hub, Settings (.tsx)
│   │   ├── services/           # Axios API Client Wrappers (.ts)
│   │   └── types/              # Centralized TypeScript Interfaces (.ts)
│   ├── index.html
│   ├── tsconfig.json
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # DB & Env Configurations (.ts)
│   │   ├── controllers/        # Express Handlers (.ts)
│   │   ├── models/             # Mongoose Schemas (.ts)
│   │   ├── routes/             # REST Endpoints (.ts)
│   │   └── services/           # AI Service, Reminder Cron, Email Parser, Seed Service (.ts)
│   ├── tsconfig.json
│   └── package.json
│
├── vercel.json                 # Vercel Deployment Configuration
├── package.json                # Root Workspace Concurrent Orchestrator
└── README.md
```

---

## ⚡ Quick Start (Local Setup)

1. **Install Dependencies:**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

2. **Start Development Environment:**
   Run both TypeScript server and client concurrently:
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173`
   * Backend: `http://localhost:5000/api`

---

## 📤 Push to GitHub

```bash
git init
git add .
git commit -m "feat: migrate full-stack codebase to TypeScript"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ApplyTrack-AI.git
git push -u origin main
```

---

## ☁️ Deploying to Vercel

1. Import your GitHub repository in [Vercel](https://vercel.com/new).
2. Set Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).
3. Click **Deploy**. Vercel will build the React TypeScript client and deploy serverless TypeScript API handlers via `vercel.json`.
