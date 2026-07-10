import type { RaceModifier } from '@/utils/multiplayer/roomConfig.types';
import type { SessionType } from '@/utils/stats/sessionClassification';

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
  /** Album cover URL for history glassmorphism / thumbnails. */
  songCoverUrl?: string;
  /** Active modifiers during the race (excludes victory condition). */
  raceModifiers?: RaceModifier[];
  scoreOverride?: number;
  gradeOverride?: string;
  totalMultiplier?: number;
  /** Overrides automatic session classification. */
  sessionType?: SessionType;
}
