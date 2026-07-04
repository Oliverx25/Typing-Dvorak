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
