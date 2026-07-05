-- Typing Dvorak — gameplay features: ghost replays + practice-mode preferences
-- Run AFTER 10_user_stats.sql in Supabase SQL Editor.
--
-- Note: this project stores sessions in `typing_sessions` and user preferences
-- directly on `profiles` (there is no separate `user_sessions` /
-- `profile_preferences` table). Columns are added to those tables to match the
-- existing architecture.

-- ── Ghost replay data on sessions ──────────────────────────────────────────
-- Array of { i: charIndex, t: timeOffsetMs } samples recorded on record-beating runs.
alter table public.typing_sessions
  add column if not exists replay_data jsonb;

-- ── Practice-mode preferences on profiles ──────────────────────────────────
alter table public.profiles
  add column if not exists zen_mode_enabled   boolean not null default false,
  add column if not exists ghost_mode_enabled boolean not null default false,
  add column if not exists pacer_enabled      boolean not null default false,
  add column if not exists pacer_target_wpm   int     not null default 60
    check (pacer_target_wpm between 10 and 300);

-- The existing owner-scoped RLS policies on typing_sessions and profiles already
-- permit reading and writing these new columns; no policy change needed.
