-- Candid — Initial Schema
-- Reconstructed from live Supabase state + backend/app/models.py
-- (original migration was never committed — this file backfills it for reproducibility)
--
-- ASSUMPTIONS FLAGGED BELOW — verify against actual Supabase dashboard
-- (Database > Tables > [table] > columns) before trusting this as source of truth,
-- especially: exact default values, NOT NULL constraints, ON DELETE behavior.

-- ── profiles ─────────────────────────────────────────────
-- Auto-created via Supabase auth trigger (on_auth_user_created pattern) — not
-- explicit backend code. Confirm the trigger definition separately if you want
-- this file to fully reproduce the DB (Database > Triggers in dashboard).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_username text,
  created_at timestamptz not null default now()
);

-- ── sources ──────────────────────────────────────────────
-- ASSUMPTION: one row per (user_id, source_type) — enforced by unique constraint,
-- matches the upsert(on_conflict="user_id,source_type") call in sources.py
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('github', 'resume', 'linkedin', 'portfolio')),
  raw_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, source_type)
);

-- ── analyses ─────────────────────────────────────────────
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_description text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

-- ── reports ──────────────────────────────────────────────
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  missing_projects jsonb not null default '[]'::jsonb,
  skill_gaps jsonb not null default '[]'::jsonb,
  ats_issues jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ── roadmap_items ────────────────────────────────────────
create table if not exists roadmap_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  title text not null,
  description text,
  is_checked boolean not null default false,
  order_index int not null default 0
);

-- ── chat_messages ────────────────────────────────────────
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ── Indexes (recommended, not yet confirmed present) ────
-- ASSUMPTION: these likely don't exist yet unless added manually — needed
-- since every router filters by these columns on every request.
create index if not exists idx_sources_user_id on sources(user_id);
create index if not exists idx_analyses_user_id on analyses(user_id);
create index if not exists idx_reports_analysis_id on reports(analysis_id);
create index if not exists idx_roadmap_items_report_id on roadmap_items(report_id);
create index if not exists idx_chat_messages_report_id on chat_messages(report_id);

-- ── RLS NOTE ─────────────────────────────────────────────
-- Backend uses service_role key, which bypasses RLS entirely (see reports.py
-- docstring). RLS policies may or may not be enabled on these tables in
-- Supabase right now — the "1 RLS policy" badge shown on profiles in the
-- dashboard screenshot suggests at least one exists there. Confirm which
-- tables have RLS enabled and what the policies say before Phase 15
-- (Security Review) — this migration does NOT define RLS policies, since
-- ownership is currently enforced entirely in application code instead.