import type { RaceProgressPayload } from '@/types/multiplayer';

/**
 * Max Score formula:
 * Score = (WPM * 10) * (Accuracy / 100) + (MaxCombo * 5)
 *
 * Low accuracy sharply reduces WPM weight; long combos add raw bonus points.
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

/** Score and WPM only increase during a race — never decrease mid-run. */
export function mergePeakRaceProgress(
  previous: Pick<RaceProgressPayload, 'wpm' | 'score'> | undefined,
  incoming: Pick<RaceProgressPayload, 'wpm' | 'score'>,
): Pick<RaceProgressPayload, 'wpm' | 'score'> {
  return {
    wpm: Math.max(previous?.wpm ?? 0, incoming.wpm),
    score: Math.max(previous?.score ?? 0, incoming.score),
  };
}
