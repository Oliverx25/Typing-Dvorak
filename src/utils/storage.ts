import type { TypingStats } from './typing';
import type { PracticeMode } from './settings';
import { collectPracticeDates, computeStreakFromPracticeDates } from './streak';

export interface SessionRecord {
  lessonId: string;
  lessonTitle: string;
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  mode: PracticeMode;
  completedAt: string;
}

export interface LessonProgress {
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  lastPlayedAt: string;
}

export interface UserProgress {
  lessons: Record<string, LessonProgress>;
  streak: number;
  lastPracticeDate: string | null;
}

const STORAGE_KEY = 'typing-dvorak-history';
const PROGRESS_KEY = 'typing-dvorak-progress';
const THEME_KEY = 'typing-dvorak-theme';
const MAX_RECORDS = 100;

export function getSessionHistory(): SessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return { lessons: {}, streak: 0, lastPracticeDate: null };
  }
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw
      ? (JSON.parse(raw) as UserProgress)
      : { lessons: {}, streak: 0, lastPracticeDate: null };
  } catch {
    return { lessons: {}, streak: 0, lastPracticeDate: null };
  }
}

function saveProgress(progress: UserProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function updateStreak(progress: UserProgress): UserProgress {
  const dates = collectPracticeDates(getSessionHistory().map((s) => s.completedAt));
  const { streak, lastPracticeDate } = computeStreakFromPracticeDates(dates);
  return { ...progress, streak, lastPracticeDate };
}

/** Overwrite local session history and lesson progress (e.g. after cloud load). */
export function replaceLocalProgress(history: SessionRecord[], progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_RECORDS)));
  saveProgress(progress);
}

export function saveSession(
  lessonId: string,
  lessonTitle: string,
  stats: TypingStats,
  mode: PracticeMode = 'practice',
): { isNewRecord: boolean; previousBest: number } {
  const record: SessionRecord = {
    lessonId,
    lessonTitle,
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    elapsedSeconds: stats.elapsedSeconds,
    mode,
    completedAt: new Date().toISOString(),
  };

  const history = [record, ...getSessionHistory()].slice(0, MAX_RECORDS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  const progress = updateStreak(getProgress());
  const existing = progress.lessons[lessonId];
  const previousBest = existing?.bestWpm ?? 0;
  const isNewRecord = stats.wpm > previousBest;

  progress.lessons[lessonId] = {
    bestWpm: Math.max(previousBest, stats.wpm),
    bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, stats.accuracy),
    attempts: (existing?.attempts ?? 0) + 1,
    lastPlayedAt: record.completedAt,
  };

  saveProgress(progress);
  return { isNewRecord, previousBest };
}

export function getBestWpmForLesson(lessonId: string): number | null {
  return getProgress().lessons[lessonId]?.bestWpm ?? null;
}

export function getLessonProgress(lessonId: string): LessonProgress | null {
  return getProgress().lessons[lessonId] ?? null;
}

export function getCompletedLessonsMap(): Record<string, { bestAccuracy: number; bestWpm: number }> {
  const { lessons } = getProgress();
  const map: Record<string, { bestAccuracy: number; bestWpm: number }> = {};
  for (const [id, p] of Object.entries(lessons)) {
    map[id] = { bestAccuracy: p.bestAccuracy, bestWpm: p.bestWpm };
  }
  return map;
}

export function getAggregateStats() {
  const history = getSessionHistory();
  const progress = getProgress();

  if (history.length === 0) {
    return { totalSessions: 0, bestWpm: 0, avgAccuracy: 0, streak: progress.streak };
  }

  const bestWpm = Math.max(...history.map((r) => r.wpm));
  const avgAccuracy = Math.round(
    history.reduce((sum, r) => sum + r.accuracy, 0) / history.length,
  );

  return {
    totalSessions: history.length,
    bestWpm,
    avgAccuracy,
    streak: progress.streak,
  };
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
