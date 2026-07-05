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
}
