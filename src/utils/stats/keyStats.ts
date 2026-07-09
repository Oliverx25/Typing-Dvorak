import { charToKeyCode, DVORAK_ROWS } from '@/utils/keyboard/dvorak';
import { dispatchKeyStatsUpdated } from '@/utils/app/events';
import { STORAGE_KEYS } from '@/utils/progress/keys';
import { readJson, writeJson } from '@/utils/progress/localStorage';

export interface KeyStatsData {
  hits: Record<string, number>;
  misses: Record<string, number>;
}

export interface WeakKey {
  code: string;
  label: string;
  misses: number;
  errorRate: number;
}

const EMPTY_STATS: KeyStatsData = { hits: {}, misses: {} };

const CODE_TO_LABEL: Record<string, string> = {};
for (const row of DVORAK_ROWS) {
  for (const key of row.keys) {
    CODE_TO_LABEL[key.code] = key.label;
  }
}

export function codeToLabel(code: string): string {
  return CODE_TO_LABEL[code] ?? code.replace('Key', '').replace('Digit', '');
}

/** Single-character form for Supabase `key_char varchar(1)`. */
export function codeToKeyChar(code: string): string {
  const label = CODE_TO_LABEL[code];
  if (label === 'Space') return ' ';
  if (label?.length === 1) return label;
  if (code === 'Enter') return '\n';
  if (code === 'Tab') return '\t';
  const fallback = code.replace('Key', '').replace('Digit', '');
  return fallback.slice(0, 1);
}

export function getKeyStats(): KeyStatsData {
  return readJson(STORAGE_KEYS.keyStats, EMPTY_STATS);
}

function saveKeyStats(data: KeyStatsData): void {
  writeJson(STORAGE_KEYS.keyStats, data);
}

/** Overwrite heatmap stats (e.g. after cloud load). */
export function replaceKeyStats(data: KeyStatsData): void {
  saveKeyStats(data);
  dispatchKeyStatsUpdated();
}

/** Records a keystroke for heatmap analytics. */
export function recordKeystroke(char: string, isCorrect: boolean): void {
  const code = charToKeyCode(char) ?? char;
  const stats = getKeyStats();
  const bucket = isCorrect ? stats.hits : stats.misses;
  bucket[code] = (bucket[code] ?? 0) + 1;
  saveKeyStats(stats);
  dispatchKeyStatsUpdated();
}

/**
 * Maps typing outcomes to per-key heatmap stats:
 * - Correct (pure or corrected): +1 hit on the key pressed.
 * - Incorrect: +1 miss on the key pressed AND +1 miss on the expected key.
 */
export function recordHeatmapKeystroke(expected: string, typedChar: string, isCorrect: boolean): void {
  if (isCorrect) {
    recordKeystroke(typedChar, true);
    return;
  }
  recordKeystroke(typedChar, false);
  if (typedChar !== expected) {
    recordKeystroke(expected, false);
  }
}

/** Minimum keystrokes before heatmap uses full red/green intensity. */
export const HEATMAP_MIN_SAMPLES = 5;

/** Returns error rate 0–1 for a key code (0 = perfect, 1 = all misses). */
export function getKeyErrorRate(code: string, stats: KeyStatsData): number {
  const hits = stats.hits[code] ?? 0;
  const misses = stats.misses[code] ?? 0;
  const total = hits + misses;
  if (total === 0) return 0;
  return misses / total;
}

export function getKeyAttemptCount(code: string, stats: KeyStatsData): number {
  return (stats.hits[code] ?? 0) + (stats.misses[code] ?? 0);
}

/** 0–1 accuracy for heatmap coloring (1 = perfect). */
export function getKeyAccuracy(code: string, stats: KeyStatsData): number {
  return 1 - getKeyErrorRate(code, stats);
}

/** Confidence 0–1 based on sample size (ramps up to HEATMAP_MIN_SAMPLES). */
export function getKeySampleConfidence(code: string, stats: KeyStatsData): number {
  const total = getKeyAttemptCount(code, stats);
  if (total === 0) return 0;
  return Math.min(1, total / HEATMAP_MIN_SAMPLES);
}

export function hasKeyStats(stats: KeyStatsData): boolean {
  return Object.keys(stats.hits).length + Object.keys(stats.misses).length > 0;
}

/** Keys with the most misses, weighted by error rate. */
export function getWeakestKeys(limit = 5, stats = getKeyStats()): WeakKey[] {
  const codes = new Set([...Object.keys(stats.hits), ...Object.keys(stats.misses)]);
  const ranked: WeakKey[] = [];

  for (const code of codes) {
    const misses = stats.misses[code] ?? 0;
    if (misses === 0) continue;
    const errorRate = getKeyErrorRate(code, stats);
    ranked.push({ code, label: codeToLabel(code), misses, errorRate });
  }

  return ranked
    .sort((a, b) => b.misses * b.errorRate - a.misses * a.errorRate)
    .slice(0, limit);
}

export function getSessionWeakKeys(misses: Record<string, number>, limit = 3): string[] {
  return Object.entries(misses)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([char]) => char);
}
