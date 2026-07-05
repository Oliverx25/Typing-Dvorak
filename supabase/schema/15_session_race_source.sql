alter table public.typing_sessions
  add column if not exists race_source text
  check (race_source is null or race_source in ('lesson', 'custom', 'song'));
