alter table public.typing_sessions
  add column if not exists session_type text not null default 'lesson';

alter table public.typing_sessions
  drop constraint if exists typing_sessions_session_type_check;

alter table public.typing_sessions
  add constraint typing_sessions_session_type_check
  check (session_type in ('lesson', 'practice', 'multiplayer'));
