import { charToKeyCode, DVORAK_ROWS } from './dvorak';
import { dispatchKeyStatsUpdated } from './events';

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

const KEY_STATS_KEY = 'typing-dvorak-key-stats';

const CODE_TO_LABEL: Record<string, string> = {};
for (const row of DVORAK_ROWS) {
  for (const key of row.keys) {
    CODE_TO_LABEL[key.code] = key.label;
  }
}

export function codeToLabel(code: string): string {
  return CODE_TO_LABEL[code] ?? code.replace('Key', '').replace('Digit', '');
}

export function getKeyStats(): KeyStatsData {
  if (typeof window === 'undefined') return { hits: {}, misses: {} };
  try {
    const raw = localStorage.getItem(KEY_STATS_KEY);
    return raw ? (JSON.parse(raw) as KeyStatsData) : { hits: {}, misses: {} };
  } catch {
    return { hits: {}, misses: {} };
  }
}

function saveKeyStats(data: KeyStatsData): void {
  localStorage.setItem(KEY_STATS_KEY, JSON.stringify(data));
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

/** Returns error rate 0–1 for a key code (0 = perfect, 1 = all misses). */
export function getKeyErrorRate(code: string, stats: KeyStatsData): number {
  const hits = stats.hits[code] ?? 0;
  const misses = stats.misses[code] ?? 0;
  const total = hits + misses;
  if (total === 0) return 0;
  return misses / total;
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
