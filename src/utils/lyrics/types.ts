/** Shared WPM fields for song search results and persisted track metadata. */
export interface SongWpmStats {
  /** Average WPM during vocal segments (LRC active profile). */
  avgWpm: number | null;
  /** Peak WPM on the fastest vocal line. */
  maxWpm: number | null;
  /** @deprecated Use avgWpm — kept for pacing fallback in older room state. */
  trackWpm: number | null;
  highestGrade?: string | null;
  highestScore?: number | null;
  maxWpm?: number | null;
}

export type DifficultyTier = 'easy' | 'normal' | 'hard' | 'expert';
export type DifficultyColor = 'green' | 'blue' | 'orange' | 'purple';

export interface TypingDifficulty {
  tier: DifficultyTier;
  color: DifficultyColor;
  score: number;
}

/** WPM stats derived from LRC vocal segments (ignores instrumental gaps). */
export interface WpmProfile {
  activeWpm: number | null;
  peakWpm: number | null;
}

/** Word-level sync point for the musical pacer (hare). */
export interface LyricWordTiming {
  timeMs: number;
  charIndex: number;
}

export interface LyricSongResult extends SongWpmStats {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  plainLyrics: string;
  difficulty: TypingDifficulty;
  coverArt: string | null;
  durationMs: number | null;
  lyricTimeline: LyricWordTiming[];
}

/** Lightweight song snapshot persisted in room state for the race. */
export interface SelectedSongMeta extends SongWpmStats {
  id: number;
  title: string;
  artist: string;
  coverArt: string | null;
  difficulty: TypingDifficulty;
  durationMs: number | null;
  lyricTimeline: LyricWordTiming[];
}

/** Builds display + legacy pacing WPM fields from LRC profile or fallback. */
export function resolveSongWpmStats(
  wpmProfile: WpmProfile | null | undefined,
  fallbackWpm: number | null,
): SongWpmStats {
  const avgWpm = wpmProfile?.activeWpm ?? fallbackWpm;
  const maxWpm = wpmProfile?.peakWpm ?? null;
  return {
    avgWpm,
    maxWpm,
    trackWpm: avgWpm,
  };
}
