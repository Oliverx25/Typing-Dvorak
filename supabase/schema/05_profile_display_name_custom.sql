-- Typing Dvorak — profile display name source of truth
-- Run AFTER 03_profile_avatars_storage.sql in Supabase SQL Editor

alter table public.profiles
  add column if not exists display_name_custom boolean not null default false;

-- Existing rows with a saved name are treated as user-chosen (OAuth must not override).
update public.profiles
set display_name_custom = true
where display_name is not null
  and btrim(display_name) <> '';
