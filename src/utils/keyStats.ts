import { charToKeyCode } from './dvorak';

export interface KeyStatsData {
  hits: Record<string, number>;
  misses: Record<string, number>;
}

const KEY_STATS_KEY = 'typing-dvorak-key-stats';

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
