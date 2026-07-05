-- Typing Dvorak — full app settings on profiles (sound, appearance, practice mode, theme)
-- Run AFTER 11_gameplay_features.sql in Supabase SQL Editor.
--
-- Locale + gameplay columns live in 06_profile_preferences.sql and 11_gameplay_features.sql.

alter table public.profiles
  add column if not exists sound_enabled          boolean not null default false,
  add column if not exists blind_mode_enabled     boolean not null default false,
  add column if not exists finger_colors_enabled  boolean not null default true,
  add column if not exists practice_mode          text    not null default 'practice'
    check (practice_mode in ('practice', 'test')),
  add column if not exists highlight_theme        text    not null default 'indigo'
    check (highlight_theme in ('indigo', 'emerald', 'cyan', 'red', 'amber', 'fuchsia')),
  add column if not exists theme                  text    not null default 'light'
    check (theme in ('light', 'dark'));
