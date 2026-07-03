-- Typing Dvorak — Row Level Security policies
-- Run AFTER 01_initial_schema.sql

-- ── profiles ───────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── typing_sessions ────────────────────────────────────────────────────────
alter table public.typing_sessions enable row level security;

drop policy if exists "sessions_select_own" on public.typing_sessions;
create policy "sessions_select_own"
  on public.typing_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.typing_sessions;
create policy "sessions_insert_own"
  on public.typing_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.typing_sessions;
create policy "sessions_update_own"
  on public.typing_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── key_errors ─────────────────────────────────────────────────────────────
alter table public.key_errors enable row level security;

drop policy if exists "key_errors_select_own" on public.key_errors;
create policy "key_errors_select_own"
  on public.key_errors for select
  using (auth.uid() = user_id);

drop policy if exists "key_errors_insert_own" on public.key_errors;
create policy "key_errors_insert_own"
  on public.key_errors for insert
  with check (auth.uid() = user_id);

drop policy if exists "key_errors_update_own" on public.key_errors;
create policy "key_errors_update_own"
  on public.key_errors for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
