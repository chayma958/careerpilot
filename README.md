# CareerPilot

A job application tracker for people running a serious job search: track every application through a Kanban
pipeline, keep interviews on a calendar, store your CVs and cover letters, and use AI to analyze your resume
against a role, tailor it, draft a cover letter, and generate mock interview questions.

**Live demo:** https://careerpilot-omega-ecru.vercel.app/ — log in with the demo account shown on the login page (no signup required).

## Features

- Email/password auth with verification, password reset, and Google OAuth sign-in
- Application CRUD with a filterable table view and a drag-and-drop Kanban board
- Calendar view for scheduled interviews
- Document storage (CVs, cover letters, certificates) with Cloudinary-backed uploads
- AI tools per application: ATS-style CV analysis, resume tailoring suggestions, cover letter drafting,
  mock interview questions, and dashboard-level application insights
- In-app + email notifications for upcoming interviews, stale "Saved" applications, and stale "Applied"
  follow-ups
- Dashboard with charts (applications over time, status distribution, top companies)

## Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, dnd-kit, Recharts
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **File storage**: Cloudinary
- **Email**: Resend
- **AI**: OpenRouter (free-tier model), via the OpenAI SDK in OpenAI-compatible mode
- **Testing**: Vitest (both packages)
- **Linting**: oxlint (both packages)
- **CI/CD**: GitHub Actions → Vercel (frontend) + Render (backend)

## Project structure

```
CareerPilot/
├── .github/workflows/   CI/CD pipeline
├── frontend/            React + Vite app
└── backend/             Express API + Prisma
```

## Local development

### 1. Database

Run a local Postgres via Docker (recommended — no network flakiness or connection limits):

```bash
docker run -d --name careerpilot-postgres -e POSTGRES_USER=careerpilot \
  -e POSTGRES_PASSWORD=careerpilot -e POSTGRES_DB=careerpilot -p 5433:5432 postgres:17-alpine
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, RESEND_API_KEY, CLOUDINARY_*, etc.
npm install
npm run prisma:migrate      # applies migrations to your local DB
npm run db:seed             # creates the demo account with sample applications
npm run dev
```

API runs at `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### Running tests / lint

```bash
# in either frontend/ or backend/
npm run lint
npm test
npm run build
```

## Demo account

Seeded via `backend/prisma/seed.ts` (`npm run db:seed`), idempotent — safe to re-run. Credentials are
controlled by `DEMO_EMAIL` / `DEMO_PASSWORD` in `backend/.env` (and mirrored as `VITE_DEMO_EMAIL` /
`VITE_DEMO_PASSWORD` in `frontend/.env` for the login page's demo callout). Defaults:

```
demo@careerpilot.dev / Demo1234!
```

## Deployment

- **Frontend** deploys to [Vercel](https://vercel.com).
- **Backend** deploys to [Render](https://render.com), with a Render-managed PostgreSQL instance.
- Both deployments are triggered by GitHub Actions (`.github/workflows/ci-cd.yml`) **after** lint, tests, and
  build pass for both packages on a push to `main` — Vercel's automatic Git deployments are disabled so the
  only path to production is through CI.
- Required GitHub Actions secrets: `RENDER_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Required backend environment variables (Render dashboard): everything in `backend/.env.example`, with
  `CLIENT_URL` set to the production frontend URL and `DATABASE_URL` set to the production Postgres
  connection string.
- Required frontend environment variables (Vercel dashboard): `VITE_API_URL` set to the production backend
  URL, plus the demo credentials.
