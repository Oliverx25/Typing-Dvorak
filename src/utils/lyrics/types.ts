export type DifficultyTier = 'easy' | 'normal' | 'hard' | 'expert';
export type DifficultyColor = 'green' | 'blue' | 'orange' | 'purple';

export interface TypingDifficulty {
  tier: DifficultyTier;
  color: DifficultyColor;
  score: number;
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
  /** WPM the artist "sings" the lyrics at — drives the musical pacer. */
  trackWpm: number | null;
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
}
