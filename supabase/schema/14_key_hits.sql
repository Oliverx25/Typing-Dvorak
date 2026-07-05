-- Add hit counts for accuracy-based heatmap coloring.
alter table public.key_errors
  add column if not exists hit_count int not null default 0 check (hit_count >= 0);
