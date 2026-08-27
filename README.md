# Candid

Honest feedback on where you actually stand. Ingests GitHub, resume, portfolio, and
LinkedIn against a target job description — outputs missing projects, skill gaps,
ATS issues, and a weekly learning roadmap.

**Status:** Phase 1 — scaffold only. Not runnable end-to-end yet.

## Stack

- Backend: Python + FastAPI
- Frontend: Next.js (App Router) + Tailwind
- DB/Auth: Supabase (Postgres + GitHub OAuth)
- AI: Groq (`openai/gpt-oss-120b`)
- Hosting: Render (backend) + Vercel (frontend)

## Structure

```
candid/
├── backend/     # FastAPI service
├── frontend/    # Next.js app
└── .github/     # CI
```

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # fill in real values
uvicorn app.main:app --reload
```
Runs at http://localhost:8000 — check http://localhost:8000/health

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```
Runs at http://localhost:3000

## Roadmap

Full 19-phase build plan: see `candid-roadmap.md` (planning doc, not part of runtime).

## Deploy

TBD — Phase 16.
