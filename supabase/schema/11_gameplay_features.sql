-- Typing Dvorak — practice-mode preferences on profiles
-- Run AFTER 10_user_stats.sql in Supabase SQL Editor.

alter table public.profiles
  add column if not exists zen_mode_enabled   boolean not null default false,
  add column if not exists ghost_mode_enabled boolean not null default false,
  add column if not exists pacer_enabled      boolean not null default false,
  add column if not exists pacer_target_wpm   int     not null default 60
    check (pacer_target_wpm between 10 and 300);

-- The existing owner-scoped RLS policies on profiles already
-- permit reading and writing these new columns; no policy change needed.
