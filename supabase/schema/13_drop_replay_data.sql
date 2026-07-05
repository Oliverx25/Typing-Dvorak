-- Typing Dvorak — remove ghost replay_data column (ghost mode now uses lesson best WPM)
-- Run AFTER 11_gameplay_features.sql if replay_data was previously added.

alter table public.typing_sessions
  drop column if exists replay_data;
