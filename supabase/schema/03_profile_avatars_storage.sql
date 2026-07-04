-- Typing Dvorak — profile avatars + storage
-- Run AFTER 02_security_policies.sql in Supabase SQL Editor

-- ── Profile extensions ───────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists avatar_custom boolean not null default false,
  add column if not exists display_name text,
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_name text;
  v_avatar text;
begin
  v_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'user_name',
    split_part(new.email, '@', 1)
  );

  v_avatar := coalesce(
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'picture'
  );

  insert into public.profiles (id, username, display_name, avatar_url, avatar_custom)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1)),
    v_name,
    v_avatar,
    false
  );

  return new;
end;
$$;

-- ── Storage: public avatar bucket (max 2 MB, images only) ──────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Optional: allow users to delete their own key error rows ─────────────────
drop policy if exists "key_errors_delete_own" on public.key_errors;
create policy "key_errors_delete_own"
  on public.key_errors for delete
  using (auth.uid() = user_id);

-- ── Optional: allow users to delete their own sessions ───────────────────────
drop policy if exists "sessions_delete_own" on public.typing_sessions;
create policy "sessions_delete_own"
  on public.typing_sessions for delete
  using (auth.uid() = user_id);
