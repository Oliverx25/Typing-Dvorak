import type { TypingStats } from '../typing/typing';
import type { PracticeMode } from '../app/settings';
import type { RaceTextSource } from '../stats/sessionTypes';
import { MULTIPLAYER_LESSON_ID } from '../stats/sessionDisplay';
import { collectPracticeDates, computeStreakFromPracticeDates } from './streak';
import { STORAGE_KEYS } from './keys';
import { readJson, writeJson, readString, writeString } from './localStorage';
import { calculateGrade, bestGrade } from '../grading';

export interface SessionRecord {
  lessonId: string;
  lessonTitle: string;
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  mode: PracticeMode;
  completedAt: string;
  maxCombo?: number;
  grade?: string;
  score?: number;
  /** Set when lessonId is multiplayer — origin of race text. */
  multiplayerSource?: RaceTextSource;
}

export interface LessonProgress {
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  lastPlayedAt: string;
  highestGrade?: string;
  highestScore?: number;
  maxWpm?: number;
}

export interface UserProgress {
  lessons: Record<string, LessonProgress>;
  streak: number;
  lastPracticeDate: string | null;
}

const MAX_RECORDS = 100;
const EMPTY_PROGRESS: UserProgress = { lessons: {}, streak: 0, lastPracticeDate: null };

export function getSessionHistory(): SessionRecord[] {
  return readJson(STORAGE_KEYS.history, [] as SessionRecord[]);
}

export function getProgress(): UserProgress {
  return readJson(STORAGE_KEYS.progress, EMPTY_PROGRESS);
}

function saveProgress(progress: UserProgress): void {
  writeJson(STORAGE_KEYS.progress, progress);
}

function updateStreak(progress: UserProgress): UserProgress {
  const dates = collectPracticeDates(getSessionHistory().map((s) => s.completedAt));
  const { streak, lastPracticeDate } = computeStreakFromPracticeDates(dates);
  return { ...progress, streak, lastPracticeDate };
}

/** Overwrite local session history and lesson progress (e.g. after cloud load). */
export function replaceLocalProgress(history: SessionRecord[], progress: UserProgress): void {
  writeJson(STORAGE_KEYS.history, history.slice(0, MAX_RECORDS));
  saveProgress(progress);
}

export function saveSession(
  lessonId: string,
  lessonTitle: string,
  stats: TypingStats,
  mode: PracticeMode = 'practice',
  maxCombo = 0,
  options?: { multiplayerSource?: RaceTextSource },
): { isNewRecord: boolean; previousBest: number; record: SessionRecord } {
  const grade = calculateGrade(stats.accuracy);
  const score = Math.round(stats.wpm * 10 * (stats.accuracy / 100) + maxCombo * 5);
  const record: SessionRecord = {
    lessonId,
    lessonTitle,
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    elapsedSeconds: stats.elapsedSeconds,
    mode,
    completedAt: new Date().toISOString(),
    maxCombo: maxCombo > 0 ? maxCombo : undefined,
    grade,
    score,
    multiplayerSource: options?.multiplayerSource,
  };

  const history = [record, ...getSessionHistory()].slice(0, MAX_RECORDS);
  writeJson(STORAGE_KEYS.history, history);

  const progress = updateStreak(getProgress());
  const previousBest = progress.lessons[lessonId]?.bestWpm ?? 0;
  const isNewRecord = lessonId !== MULTIPLAYER_LESSON_ID && stats.wpm > previousBest;

  if (lessonId !== MULTIPLAYER_LESSON_ID) {
    const existing = progress.lessons[lessonId];
    progress.lessons[lessonId] = {
      bestWpm: Math.max(previousBest, stats.wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, stats.accuracy),
      attempts: (existing?.attempts ?? 0) + 1,
      lastPlayedAt: record.completedAt,
      highestGrade: bestGrade(existing?.highestGrade, grade) ?? grade,
      highestScore: Math.max(existing?.highestScore ?? 0, score),
      maxWpm: Math.max(existing?.maxWpm ?? 0, stats.wpm),
    };
  }

  saveProgress(progress);
  return { isNewRecord, previousBest, record };
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
  const stored = readString(STORAGE_KEYS.theme);
  if (stored === 'dark' || stored === 'light') return stored;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setStoredTheme(theme: Theme): void {
  writeString(STORAGE_KEYS.theme, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function initTheme(): void {
  setStoredTheme(getStoredTheme());
}
