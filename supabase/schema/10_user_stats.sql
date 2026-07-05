-- Typing Dvorak — aggregated user stats for incremental achievements
-- Run AFTER 07_max_combo.sql in Supabase SQL Editor.

create table if not exists public.user_stats (
  user_id                   uuid primary key references public.profiles (id) on delete cascade,
  total_sessions_played     int not null default 0 check (total_sessions_played >= 0),
  total_perfect_sessions    int not null default 0 check (total_perfect_sessions >= 0),
  highest_wpm_ever          int not null default 0 check (highest_wpm_ever >= 0),
  highest_combo_ever        int not null default 0 check (highest_combo_ever >= 0),
  current_day_streak        int not null default 0 check (current_day_streak >= 0),
  total_multiplayer_matches int not null default 0 check (total_multiplayer_matches >= 0),
  total_multiplayer_wins    int not null default 0 check (total_multiplayer_wins >= 0),
  updated_at                timestamptz not null default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "user_stats_select_own" on public.user_stats;
create policy "user_stats_select_own"
  on public.user_stats for select
  using (auth.uid() = user_id);

drop policy if exists "user_stats_insert_own" on public.user_stats;
create policy "user_stats_insert_own"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_stats_update_own" on public.user_stats;
create policy "user_stats_update_own"
  on public.user_stats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
