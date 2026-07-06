import type { RaceModifier } from '../multiplayer/roomConfig.types';

/** Origin of text used in a multiplayer race. */
export type RaceTextSource = 'lesson' | 'custom' | 'song';

export interface SessionPersistOptions {
  lessonId?: string;
  lessonTitle?: string;
  multiplayerSource?: RaceTextSource;
  /** LRC track id when racing a song — persists per-song grade/score. */
  songId?: number;
  /** Song display title for stats/history when racing a song. */
  songTitle?: string;
  /** Active modifiers during the race (excludes victory condition). */
  raceModifiers?: RaceModifier[];
  scoreOverride?: number;
  gradeOverride?: string;
  totalMultiplier?: number;
}
