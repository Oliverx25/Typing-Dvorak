-- Typing Dvorak — session telemetry for history detail views
-- Run in Supabase SQL Editor after existing typing_sessions migrations.

alter table public.typing_sessions
  add column if not exists keystroke_log jsonb,
  add column if not exists consistency numeric(5, 2) check (consistency >= 0 and consistency <= 100),
  add column if not exists trouble_keys jsonb;

comment on column public.typing_sessions.keystroke_log is
  'Per-keystroke deltas for scatter plot replay (expectedChar, typedChar, isCorrect, timeSinceLastKey, index).';
comment on column public.typing_sessions.consistency is
  'Consistency score 0–100 derived from inter-keystroke variance.';
comment on column public.typing_sessions.trouble_keys is
  'JSON array of problematic key labels from the session.';
