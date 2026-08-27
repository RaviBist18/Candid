alter table roadmap_items
  add column if not exists project_title text not null default '';