-- Candid — Add per-analysis resume/portfolio fields
-- Resume and portfolio are ephemeral, entered fresh per analysis (not
-- persisted in `sources` table), since users tailor resumes per JD.
-- GitHub + LinkedIn remain in `sources` (persistent, connect-once).

alter table analyses
  add column if not exists resume_text text not null default '',
  add column if not exists portfolio_url text;