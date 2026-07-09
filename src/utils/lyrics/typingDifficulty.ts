import type { TypingDifficulty, WpmProfile } from '@/utils/lyrics/types';

const LETTER = /[a-zA-Z\u00C0-\u024F]/g;
const PUNCTUATION = /[.,!?;:'"—–()[\]{}/\\@#$%^&*+=<>~`|-]/g;

export const PEAK_WPM_HARD_THRESHOLD = 110;
export const PEAK_WPM_EXPERT_THRESHOLD = 140;

/** Estimates typing difficulty from cleaned lyric text and optional LRC WPM profile. */
export function calculateTypingDifficulty(
  text: string,
  wpmProfile?: WpmProfile | null,
): TypingDifficulty {
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

  let tier: TypingDifficulty['tier'];
  let color: TypingDifficulty['color'];

  if (score < 25) {
    tier = 'easy';
    color = 'green';
  } else if (score < 45) {
    tier = 'normal';
    color = 'blue';
  } else if (score < 65) {
    tier = 'hard';
    color = 'orange';
  } else {
    tier = 'expert';
    color = 'purple';
  }

  const peakWpm = wpmProfile?.peakWpm ?? null;
  if (peakWpm !== null && peakWpm > PEAK_WPM_HARD_THRESHOLD) {
    if (peakWpm >= PEAK_WPM_EXPERT_THRESHOLD || tier === 'expert') {
      tier = 'expert';
      color = 'purple';
    } else {
      tier = 'hard';
      color = 'orange';
    }
  }

  return { tier, color, score };
}

/** Counts whitespace-separated tokens in lyric text. */
export function countLyricWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Fallback target WPM when no LRC vocal profile is available.
 * Prefer {@link WpmProfile.activeWpm} from synced lyrics when present.
 */
export function computeTrackWpm(wordCount: number, durationMs: number | null): number | null {
  if (!durationMs || durationMs <= 0 || wordCount <= 0) return null;
  const durationSeconds = durationMs / 1000;
  const wpm = Math.round((wordCount / durationSeconds) * 60);
  return wpm > 0 ? wpm : null;
}

export const DIFFICULTY_BADGE_CLASSES: Record<TypingDifficulty['color'], string> = {
  green:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  orange:
    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
  purple:
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
};
