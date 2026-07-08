-- Typing Dvorak — user achievements (badges)
-- DEPRECATED: superseded by public.user_achievements (achievement catalog v2).
-- Kept for historical exports only; no new writes from the app.
-- Run AFTER 03_profile_avatars_storage.sql in Supabase SQL Editor

create table if not exists public.user_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  badge_id    text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists user_badges_user_id_idx on public.user_badges (user_id);
create index if not exists user_badges_badge_id_idx on public.user_badges (user_id, badge_id);

alter table public.user_badges enable row level security;

drop policy if exists "user_badges_select_own" on public.user_badges;
create policy "user_badges_select_own"
  on public.user_badges for select
  using (auth.uid() = user_id);

drop policy if exists "user_badges_insert_own" on public.user_badges;
create policy "user_badges_insert_own"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_badges_update_own" on public.user_badges;
create policy "user_badges_update_own"
  on public.user_badges for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_badges_delete_own" on public.user_badges;
create policy "user_badges_delete_own"
  on public.user_badges for delete
  using (auth.uid() = user_id);
