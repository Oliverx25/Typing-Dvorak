import type { TypingStats } from './typing';

export interface SessionRecord {
  lessonId: string;
  lessonTitle: string;
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  completedAt: string;
}

const STORAGE_KEY = 'typing-dvorak-history';
const THEME_KEY = 'typing-dvorak-theme';
const MAX_RECORDS = 50;

export function getSessionHistory(): SessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(
  lessonId: string,
  lessonTitle: string,
  stats: TypingStats,
): void {
  const record: SessionRecord = {
    lessonId,
    lessonTitle,
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    elapsedSeconds: stats.elapsedSeconds,
    completedAt: new Date().toISOString(),
  };

  const history = [record, ...getSessionHistory()].slice(0, MAX_RECORDS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getBestWpmForLesson(lessonId: string): number | null {
  const records = getSessionHistory().filter((r) => r.lessonId === lessonId);
  if (records.length === 0) return null;
  return Math.max(...records.map((r) => r.wpm));
}

export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function initTheme(): void {
  setStoredTheme(getStoredTheme());
}
