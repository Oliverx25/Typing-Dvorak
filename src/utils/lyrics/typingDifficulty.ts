import type { TypingDifficulty } from './types';

const LETTER = /[a-zA-Z\u00C0-\u024F]/g;
const PUNCTUATION = /[.,!?;:'"—–\-()[\]{}\/\\@#$%^&*+=<>~`|]/g;

/** Estimates typing difficulty from cleaned lyric text. */
export function calculateTypingDifficulty(text: string): TypingDifficulty {
  const letters = text.match(LETTER)?.length ?? 0;
  const punctuation = text.match(PUNCTUATION)?.length ?? 0;
  const words = text.trim().split(/\s+/).filter(Boolean);

  const avgWordLen =
    words.length > 0
      ? words.reduce((sum, word) => sum + (word.match(LETTER)?.length ?? 0), 0) / words.length
      : 0;

  const punctRatio = letters > 0 ? punctuation / letters : 0;

  let score = 0;
  score += Math.min(40, avgWordLen * 8);
  score += Math.min(40, punctRatio * 200);
  score += Math.min(20, words.length / 15);
  score = Math.round(Math.min(100, Math.max(0, score)));

  if (score < 25) return { tier: 'easy', color: 'green', score };
  if (score < 45) return { tier: 'normal', color: 'blue', score };
  if (score < 65) return { tier: 'hard', color: 'orange', score };
  return { tier: 'expert', color: 'purple', score };
}

export const DIFFICULTY_BADGE_CLASSES: Record<TypingDifficulty['color'], string> = {
  green: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  blue: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
  orange: 'border-orange-500/40 bg-orange-500/15 text-orange-300',
  purple: 'border-purple-500/40 bg-purple-500/15 text-purple-300',
};
