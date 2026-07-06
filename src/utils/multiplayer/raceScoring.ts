import { calculateWpm, calculateAccuracy } from '@/utils/typing/typing';
import { calculateGrade, gradeRingClass } from '@/utils/grading';

/** Minimum typing window before WPM is reported in races. */
export const RACE_MIN_ELAPSED_MS = 2_000;

/** Minimum correct characters before WPM is reported in races. */
export const RACE_MIN_CHARS = 8;

export const RACE_COUNTDOWN_SECONDS = 3;

/** Base points per correct keystroke (osu-style). */
export const RACE_BASE_HIT_SCORE = 100;

/**
 * Stable WPM for multiplayer — avoids 12k WPM spikes on the first keypress.
 */
export function calculateStableRaceWpm(correctChars: number, elapsedMs: number): number {
  if (correctChars < RACE_MIN_CHARS || elapsedMs < RACE_MIN_ELAPSED_MS) return 0;
  return calculateWpm(correctChars, elapsedMs);
}

/**
 * Race accuracy uses cumulative mistakes — backspace does not erase prior errors.
 */
export function calculateRaceAccuracy(correctChars: number, totalErrors: number): number {
  return calculateAccuracy(correctChars, totalErrors);
}

/**
 * Combo multiplier inspired by osu! — grows with streak, capped at 4×.
 */
export function comboMultiplier(combo: number): number {
  const safeCombo = Math.max(0, combo);
  return 1 + Math.min(safeCombo, 300) * 0.01;
}

/**
 * Points earned for one correct keystroke at the current combo and accuracy.
 */
export function scoreIncrementForHit(comboAfterHit: number, accuracyPercent: number): number {
  const accuracyFactor = Math.max(0, Math.min(100, accuracyPercent)) / 100;
  return Math.round(RACE_BASE_HIT_SCORE * comboMultiplier(comboAfterHit) * accuracyFactor);
}

/**
 * @deprecated Use cumulative race score from {@link scoreIncrementForHit}.
 */
export function calculateMaxScore(
  wpm: number,
  accuracyPercent: number,
  maxCombo: number,
): number {
  const safeWpm = Math.max(0, wpm);
  const safeAccuracy = Math.min(100, Math.max(0, accuracyPercent));
  const safeCombo = Math.max(0, maxCombo);
  const speedComponent = safeWpm * 10 * (safeAccuracy / 100);
  const comboComponent = safeCombo * 5;
  return Math.round(speedComponent + comboComponent);
}

export function formatRaceScore(score: number): string {
  return score.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Estimates correct keystrokes vs cumulative errors for results display. */
export function estimateRaceHitBreakdown(
  accuracy: number,
  percentage: number,
  raceCharCount: number,
  finished: boolean,
): { correct: number; errors: number } {
  const safeAccuracy = Math.max(0, Math.min(100, accuracy));
  const progressChars = finished
    ? raceCharCount
    : Math.max(0, Math.round((raceCharCount * percentage) / 100));

  if (progressChars <= 0) return { correct: 0, errors: 0 };
  if (safeAccuracy >= 100) return { correct: progressChars, errors: 0 };

  const correct = Math.round((progressChars * safeAccuracy) / 100);
  const errors = Math.max(0, Math.round(correct * ((100 - safeAccuracy) / safeAccuracy)));
  return { correct, errors };
}

/** Theoretical max race score if every keystroke is perfect with growing combo. */
export function estimateMaxRaceScore(charCount: number, scoreMultiplier = 1): number {
  if (charCount <= 0) return 1;
  let total = 0;
  for (let combo = 1; combo <= charCount; combo++) {
    total += Math.round(scoreIncrementForHit(combo, 100) * scoreMultiplier);
  }
  return Math.max(total, 1);
}

/** Score and WPM only increase during a race — never decrease mid-run. */
export function mergePeakRaceProgress(
  previous: { wpm: number; score: number } | undefined,
  incoming: { wpm: number; score: number },
): { wpm: number; score: number } {
  return {
    wpm: Math.max(previous?.wpm ?? 0, incoming.wpm),
    score: Math.max(previous?.score ?? 0, incoming.score),
  };
}

/** Letter grade from accuracy for results screen. */
export function accuracyGrade(accuracy: number): string {
  return calculateGrade(accuracy);
}

export function gradeAccent(grade: string): string {
  return gradeRingClass(grade);
}

/** Clamp countdown to the expected pre-race window. */
export function resolveRaceCountdownSeconds(raceStartedAt: number, now = Date.now()): {
  countdownSeconds: number | null;
  raceActive: boolean;
} {
  const raw = Math.ceil((raceStartedAt - now) / 1000);

  if (raw > RACE_COUNTDOWN_SECONDS) {
    return { countdownSeconds: RACE_COUNTDOWN_SECONDS, raceActive: false };
  }
  if (raw > 0) {
    return { countdownSeconds: raw, raceActive: false };
  }
  return { countdownSeconds: null, raceActive: true };
}
