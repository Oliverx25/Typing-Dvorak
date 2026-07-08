import { calculateWpm } from '@/utils/typing/typing';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';

export interface TroubleKeyBadge {
  key: string;
  tone: 'error' | 'warning';
}

function displayKey(char: string): string {
  if (char === ' ') return '␣';
  if (char === '\n') return '↵';
  if (char === '\t') return '⇥';
  return char;
}

/** WPM without error penalty — all keystrokes count toward speed. */
export function calculateRawWpm(
  correctChars: number,
  incorrectChars: number,
  elapsedMs: number,
): number {
  return calculateWpm(correctChars + incorrectChars, elapsedMs);
}

/** Consistency score from inter-keystroke delta variance (0–100). */
export function calculateConsistencyScore(log: KeystrokeLogEntry[]): number {
  const deltas = log.map((entry) => entry.timeSinceLastKey).filter((ms) => ms > 0);
  if (deltas.length < 2) return 100;

  const mean = deltas.reduce((sum, ms) => sum + ms, 0) / deltas.length;
  if (mean <= 0) return 100;

  const variance = deltas.reduce((sum, ms) => sum + (ms - mean) ** 2, 0) / deltas.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  return Math.round(Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100)));
}

export function averageKeystrokeDelta(log: KeystrokeLogEntry[]): number {
  const deltas = log.map((entry) => entry.timeSinceLastKey).filter((ms) => ms > 0);
  if (deltas.length === 0) return 0;
  return Math.round(deltas.reduce((sum, ms) => sum + ms, 0) / deltas.length);
}

export function getTroubleKeyBadges(
  log: KeystrokeLogEntry[],
  weakKeys: string[],
): TroubleKeyBadge[] {
  const badges: TroubleKeyBadge[] = [];
  const seen = new Set<string>();

  for (const key of weakKeys.slice(0, 2)) {
    const label = displayKey(key);
    badges.push({ key: label, tone: 'error' });
    seen.add(label);
  }

  const avgByExpected = new Map<string, number[]>();
  for (const entry of log) {
    if (!entry.isCorrect || entry.timeSinceLastKey <= 0) continue;
    const label = displayKey(entry.expectedChar);
    const bucket = avgByExpected.get(label) ?? [];
    bucket.push(entry.timeSinceLastKey);
    avgByExpected.set(label, bucket);
  }

  const slowest = [...avgByExpected.entries()]
    .map(([key, times]) => ({
      key,
      avg: times.reduce((sum, ms) => sum + ms, 0) / times.length,
    }))
    .filter(({ key }) => !seen.has(key))
    .sort((a, b) => b.avg - a.avg);

  for (const { key } of slowest) {
    if (badges.length >= 3) break;
    badges.push({ key, tone: 'warning' });
    seen.add(key);
  }

  return badges.slice(0, 3);
}
