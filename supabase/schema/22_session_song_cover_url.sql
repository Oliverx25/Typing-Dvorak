alter table public.typing_sessions
  add column if not exists song_cover_url text;
