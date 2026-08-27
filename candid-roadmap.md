# Candid — Phase 0.75 Roadmap

Project: **Candid** (AI Career Navigator, honest/candidate double-meaning)
Framework: 19-phase Idea-to-Deployment master prompt
Status: All decisions locked, Groq AI-quality test passed (openai/gpt-oss-120b, good enough for v1)

---

## Locked Stack Summary

| Layer | Choice |
|---|---|
| Backend | Python + FastAPI |
| Frontend | Next.js (App Router) + light server actions |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (GitHub OAuth) |
| AI | Groq free tier, `openai/gpt-oss-120b` |
| Hosting | Render (backend) + Vercel (frontend) |
| Styling | Tailwind CSS |
| State | React useState/Context |
| Repo | Monorepo |
| Testing | Standard (unit + integration) |
| Scale | <100 users |
| Workflow | Solo fast-iteration (Auth + Security always full scrutiny) |

**Pages/sections (7):** Landing, Auth, Dashboard/History, Connect Sources/Profile, Run Analysis, Report (gaps+roadmap+chat), Follow-up Chat

---

## Phase-by-Phase Plan

**1. Project Scaffold**
Build: monorepo (`/frontend` Next.js, `/backend` FastAPI), env config, git init, README skeleton, CI placeholder.
Done when: both apps run locally empty-shell, `git log` has first commit.

**2. Data Layer**
Build: Supabase Postgres schema — users, sources (github/resume/linkedin/portfolio), analyses, reports, roadmap_items, chat_messages.
Done when: migrations run clean, seed data inserts, JSONB fields hold parsed raw source data.

**3. Backend Core**
Build: FastAPI app structure, routing skeleton, core service layer (no auth yet).
Done when: `/health` endpoint responds, folder structure supports parsing/analysis/AI modules separately.

**4. Auth & Access Control** *(full scrutiny — no fast-mode shortcuts)*
Build: Supabase Auth + GitHub OAuth wiring, session handling, protected routes both frontend+backend.
Done when: login/logout works end-to-end, protected API rejects unauthenticated calls, token validated server-side not just trusted from client.

**5. API Layer**
Build: endpoints for sources CRUD, analysis trigger, report fetch, chat. Request validation (Pydantic), consistent error format.
Done when: Postman/curl hits every endpoint, invalid input returns structured 4xx not raw traceback.

**6. AI Layer**
Build: Groq client wrapper, prompt templates (gap-analysis + follow-up chat), structured JSON output mode (not raw markdown — fix from test), timeout/retry, fallback message on failure.
Done when: same test resume+JD from earlier returns clean JSON matching Report schema, failure path returns graceful error not crash.

**7. UI Planning**
Build: per-page spec — components, actions, API calls, empty/loading/error states. Design direction: light theme, card-based, one accent color, Tailwind `dark:` variants scaffolded (not activated).
Done when: written spec covers all 7 pages, ready to build against.

**8. Frontend Scaffold**
Build: Next.js routing, base layout, nav, which-calls-go-where doc (server action vs direct FastAPI call — e.g. GitHub OAuth callback → Next.js action → FastAPI `/analyze`).
Done when: empty pages route correctly, shared layout renders.

**9. Frontend-Backend Integration**
Build: wire real API calls per page, loading/error/empty states.
Done when: dashboard shows real (even if empty) data from backend, not mocked.

**10. Core Feature Build-out**
Build one at a time: source connect (GitHub OAuth, resume upload+paste, LinkedIn paste, portfolio URL) → run analysis → report display → interactive roadmap checklist → follow-up chat → dashboard history.
Done when: each feature works solo before moving to next.

**11. Styling/UX Pass**
Build: consistency pass, spacing/typography polish across all pages.
Done when: visually consistent, no leftover unstyled defaults.

**12. Testing** *(never skip silently)*
Build: unit tests on parsing + gap-analysis logic, integration tests on API endpoints, manual pass on UI flows.
Done when: test suite runs in CI, parsing edge cases (bad PDF, empty paste) covered.

**13. Error Handling & Edge Cases**
Build: bad input, network failure, AI timeout, duplicate analysis, empty source data.
Done when: each edge case manually triggered, app degrades gracefully not crashes.

**14. Performance Pass** — *near-skip, logged reason: <100 users scale, no load testing needed.*

**15. Security Review** *(mandatory before deploy, full scrutiny)*
Build: no hardcoded secrets (audit env vars), input sanitized, dependency check (`pip audit`/`npm audit`), exposed endpoint review, Supabase RLS policies checked.
Done when: checklist cleared, no secrets in git history.

**16. Deployment Setup**
Build: Render backend deploy, Vercel frontend deploy, prod env vars set both platforms, domain/DNS if applicable.
Done when: both live URLs reachable, talk to each other correctly.

**17. Pre-Launch Checklist**
Build: fresh clone → clean run test, docs accuracy check, rollback plan documented.
Done when: someone else (or you, fresh machine) can clone+run following README alone.

**18. Launch**
Build: deploy final, smoke test in prod (real signup → real analysis → real report).
Done when: full user journey works live, not just locally.

**19. Post-Launch & Docs**
Build: basic logging/error tracking, onboarding flow for first-time users, finished README.
Done when: README covers run-locally, deploy, extend-later; a stranger could pick this up.

---

## Remaining Risks / Unknowns

- **Groq rate limits** — free tier has req/min + daily token caps, unverified under real multi-user testing (low risk given <100 users scale, but flag if analysis runs feel slow/queued).
- **LinkedIn manual-paste UX** — untested how messy pasted LinkedIn export text is to parse reliably; may need prompt-level cleanup in Phase 6.
- **Groq structured-output reliability** — test returned clean markdown tables, not yet tested in strict-JSON mode; verify in Phase 6 before building Report UI around assumed schema.

---

## Confirmation Required

Reply "confirmed" to lock this roadmap and start Phase 1, or flag changes now before build starts.
