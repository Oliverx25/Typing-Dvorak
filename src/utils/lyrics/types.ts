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

export interface LyricSongResult {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  plainLyrics: string;
  difficulty: TypingDifficulty;
  coverArt: string | null;
  durationMs: number | null;
  /** Average WPM during vocal segments — drives the musical pacer when no timeline. */
  trackWpm: number | null;
  /** LRC-derived word timestamps for true ghost pacing. */
  lyricTimeline: LyricWordTiming[];
}

/** Lightweight song snapshot persisted in room state for the race. */
export interface SelectedSongMeta {
  id: number;
  title: string;
  artist: string;
  coverArt: string | null;
  difficulty: TypingDifficulty;
  durationMs: number | null;
  trackWpm: number | null;
  lyricTimeline: LyricWordTiming[];
}
