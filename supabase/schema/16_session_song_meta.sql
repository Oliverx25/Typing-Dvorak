alter table public.typing_sessions
  add column if not exists song_title text;

alter table public.typing_sessions
  add column if not exists race_modifiers text[] default '{}';
