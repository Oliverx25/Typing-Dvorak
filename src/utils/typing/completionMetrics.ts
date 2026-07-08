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

export interface KeystrokeDistribution {
  pureCorrect: number;
  corrected: number;
  errors: number;
}

/** Classify final keystrokes into pure correct, corrected-after-error, and committed errors. */
export function calculateKeystrokeDistribution(log: KeystrokeLogEntry[]): KeystrokeDistribution {
  const attemptsByIndex = new Map<number, KeystrokeLogEntry[]>();

  for (const entry of log) {
    const bucket = attemptsByIndex.get(entry.index) ?? [];
    bucket.push(entry);
    attemptsByIndex.set(entry.index, bucket);
  }

  let pureCorrect = 0;
  let corrected = 0;
  let errors = 0;

  for (const entries of attemptsByIndex.values()) {
    const hadIncorrect = entries.some((entry) => !entry.isCorrect);
    const final = entries[entries.length - 1];

    if (!hadIncorrect && final.isCorrect) {
      pureCorrect += 1;
    } else if (hadIncorrect && final.isCorrect) {
      corrected += 1;
    } else {
      errors += 1;
    }
  }

  return { pureCorrect, corrected, errors };
}

/**
 * Single source of truth for accuracy across every mode.
 *
 * Only pure-correct keystrokes count as hits; both corrected (amber) and
 * committed errors (red) penalize the score:
 * `accuracy = pureCorrect / (pureCorrect + corrected + errors) * 100`.
 */
export function accuracyFromDistribution(distribution: KeystrokeDistribution): number {
  const total = distribution.pureCorrect + distribution.corrected + distribution.errors;
  if (total <= 0) return 100;
  return Math.round((distribution.pureCorrect / total) * 100);
}

/** Convenience: derive unified accuracy straight from a keystroke log. */
export function accuracyFromKeystrokeLog(log: KeystrokeLogEntry[]): number {
  return accuracyFromDistribution(calculateKeystrokeDistribution(log));
}
