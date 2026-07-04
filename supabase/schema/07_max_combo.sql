-- Typing Dvorak — max combo tracking + multiplayer race results
-- Run AFTER 06_profile_preferences.sql in Supabase SQL Editor.

-- ── Max combo on typing sessions ───────────────────────────────────────────
-- Highest streak of consecutive correct keystrokes in a session.
alter table public.typing_sessions
  add column if not exists max_combo int not null default 0 check (max_combo >= 0);

-- The existing owner-scoped RLS policies (sessions_select/insert/update_own)
-- already permit reading and writing this new column; no policy change needed.

-- ── Race results (multiplayer) ─────────────────────────────────────────────
create table if not exists public.race_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  room_code     text not null,
  wpm           int  not null check (wpm >= 0),
  accuracy      numeric(5, 2) not null check (accuracy >= 0 and accuracy <= 100),
  max_combo     int  not null default 0 check (max_combo >= 0),
  finished      boolean not null default false,
  win_condition text not null default 'first_finish',
  placement     int,
  created_at    timestamptz not null default now()
);

create index if not exists race_results_user_id_idx on public.race_results (user_id);
create index if not exists race_results_room_code_idx on public.race_results (room_code);

alter table public.race_results enable row level security;

drop policy if exists "race_results_select_own" on public.race_results;
create policy "race_results_select_own"
  on public.race_results for select
  using (auth.uid() = user_id);

drop policy if exists "race_results_insert_own" on public.race_results;
create policy "race_results_insert_own"
  on public.race_results for insert
  with check (auth.uid() = user_id);

drop policy if exists "race_results_update_own" on public.race_results;
create policy "race_results_update_own"
  on public.race_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
