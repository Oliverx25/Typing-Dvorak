-- Typing Dvorak — initial schema
-- Run in Supabase SQL Editor or via CLI after creating your project.

-- ── Profiles (extends auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  username            text,
  current_streak      int          not null default 0,
  last_practice_date  date,
  created_at          timestamptz  not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Typing sessions ────────────────────────────────────────────────────────
create table if not exists public.typing_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  lesson_id   text not null,
  wpm         int  not null check (wpm >= 0),
  accuracy    numeric(5, 2) not null check (accuracy >= 0 and accuracy <= 100),
  stars       int  not null check (stars between 1 and 3),
  mode        text not null default 'practice',
  created_at  timestamptz not null default now()
);

create index if not exists typing_sessions_user_id_idx on public.typing_sessions (user_id);
create index if not exists typing_sessions_lesson_id_idx on public.typing_sessions (user_id, lesson_id);
create index if not exists typing_sessions_created_at_idx on public.typing_sessions (user_id, created_at desc);

-- ── Key error heatmap (aggregated per user) ────────────────────────────────
create table if not exists public.key_errors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  key_char    varchar(1) not null,
  error_count int not null default 0 check (error_count >= 0),
  unique (user_id, key_char)
);

create index if not exists key_errors_user_id_idx on public.key_errors (user_id);
