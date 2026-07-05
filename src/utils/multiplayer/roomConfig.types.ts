/** Stackable rule modifiers (osu!-style). */
export type RaceModifier =
  | 'sudden_death'
  | 'blind_mode'
  | 'strict'
  | 'flashlight'
  | 'double_time'
  | 'rhythm_lock'
  | 'vampire'
  | 'hidden'
  | 'half_time';

/** Mutually exclusive — how the winner is determined. */
export type VictoryCondition = 'max_score' | 'first_finish' | 'highest_wpm';
