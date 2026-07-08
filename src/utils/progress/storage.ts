import type { TypingStats } from '@/utils/typing/typing';
import type { PracticeMode } from '@/utils/app/settings';
import type { RaceTextSource } from '@/utils/stats/sessionTypes';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig.types';
import { MULTIPLAYER_LESSON_ID } from '@/utils/stats/sessionDisplay';
import { collectPracticeDates, computeStreakFromPracticeDates } from '@/utils/progress/streak';
import { STORAGE_KEYS } from '@/utils/progress/keys';
import { readJson, writeJson, readString, writeString } from '@/utils/progress/localStorage';
import { calculateGrade, bestGrade } from '@/utils/grading';
import { calculateMaxScore } from '@/utils/multiplayer/raceScoring';
import { saveSongProgress } from '@/utils/progress/songProgress';
import { masteryXpForSession, isMicroLessonForMastery } from '@/utils/curriculum/mastery';
import { resolveLessonId, LEGACY_LESSON_ID_MAP } from '@/utils/progress/legacyLessonIds';
import { accumulateMasteryXpFromSessions } from '@/utils/curriculum/masteryHistory';
import {
  mergeSessionIntoLessonProgress,
  aggregateLessonsFromSessions,
  lessonProgressToPerformance,
  type LessonMasteryPerformance,
} from '@/utils/progress/lessonProgressAggregate';

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
  /** Song title when multiplayerSource is 'song'. */
  songTitle?: string;
  /** Active race modifiers (excludes victory condition). */
  raceModifiers?: RaceModifier[];
}

export interface LessonProgress {
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  lastPlayedAt: string;
  highestGrade?: string;
  highestScore?: number;
  maxWpm?: number;
  masteryXp?: number;
  testBestWpm?: number;
  testBestAccuracy?: number;
  testHighestGrade?: string;
  testAttempts?: number;
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
  options?: {
    multiplayerSource?: RaceTextSource;
    songId?: number;
    songTitle?: string;
    raceModifiers?: RaceModifier[];
    scoreOverride?: number;
    gradeOverride?: string;
    totalMultiplier?: number;
    blindMode?: boolean;
  },
): { isNewRecord: boolean; previousBest: number; record: SessionRecord } {
  const gradeMultiplier = options?.blindMode ? 1.2 : (options?.totalMultiplier ?? 1);
  const grade =
    options?.gradeOverride ?? calculateGrade(stats.accuracy, gradeMultiplier);
  const score =
    options?.scoreOverride ??
    Math.round(stats.wpm * 10 * (stats.accuracy / 100) + maxCombo * 5);
  const normalizedLessonId = resolveLessonId(lessonId);
  const record: SessionRecord = {
    lessonId: normalizedLessonId,
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
    songTitle: options?.songTitle,
    raceModifiers: options?.raceModifiers?.length ? options.raceModifiers : undefined,
  };

  const history = [record, ...getSessionHistory()].slice(0, MAX_RECORDS);
  writeJson(STORAGE_KEYS.history, history);

  const progress = updateStreak(getProgress());
  const previousBest = progress.lessons[normalizedLessonId]?.bestWpm ?? 0;
  const isNewRecord = normalizedLessonId !== MULTIPLAYER_LESSON_ID && stats.wpm > previousBest;

  if (normalizedLessonId !== MULTIPLAYER_LESSON_ID) {
    const existing = progress.lessons[normalizedLessonId];
    const merged = mergeSessionIntoLessonProgress(existing, record);
    const sessionXp = masteryXpForSession({
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      grade,
      isMicroLesson: isMicroLessonForMastery(lessonId),
      mode,
    });

    progress.lessons[normalizedLessonId] = {
      ...merged,
      masteryXp: (existing?.masteryXp ?? 0) + sessionXp,
    };
  }

  saveProgress(progress);

  if (options?.songId != null) {
    saveSongProgress(options.songId, {
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      score,
      totalMultiplier: options.totalMultiplier,
    });
  }

  return { isNewRecord, previousBest, record };
}

export function getBestWpmForLesson(lessonId: string): number | null {
  const best = getProgress().lessons[lessonId]?.bestWpm;
  return best != null && best > 0 ? best : null;
}

export function getBestScoreForLesson(lessonId: string): number | null {
  const stored = getProgress().lessons[lessonId]?.highestScore;
  if (stored != null && stored > 0) return stored;

  const fromHistory = getSessionHistory()
    .filter((session) => session.lessonId === lessonId)
    .reduce((best, session) => {
      const score =
        session.score ?? calculateMaxScore(session.wpm, session.accuracy, session.maxCombo ?? 0);
      return Math.max(best, score);
    }, 0);

  return fromHistory > 0 ? fromHistory : null;
}

export function getHighestGradeForLesson(lessonId: string): string | null {
  const stored = getProgress().lessons[lessonId]?.highestGrade;
  if (stored) return stored;

  let highest: string | null = null;
  for (const session of getSessionHistory()) {
    if (session.lessonId !== lessonId) continue;
    const grade = session.grade ?? calculateGrade(session.accuracy);
    highest = bestGrade(highest, grade);
  }
  return highest;
}

export function getLessonProgress(lessonId: string): LessonProgress | null {
  const stored = getProgress().lessons[lessonId];
  const fromHistory = aggregateLessonsFromSessions(
    getSessionHistory().filter((s) => s.lessonId === lessonId),
  )[lessonId];

  if (!stored && !fromHistory) return null;

  if (!stored) return fromHistory ?? null;
  if (!fromHistory) return stored;

  return {
    ...stored,
    bestWpm: Math.max(stored.bestWpm, fromHistory.bestWpm),
    bestAccuracy: Math.max(stored.bestAccuracy, fromHistory.bestAccuracy),
    attempts: Math.max(stored.attempts, fromHistory.attempts),
    lastPlayedAt: stored.lastPlayedAt > fromHistory.lastPlayedAt ? stored.lastPlayedAt : fromHistory.lastPlayedAt,
    highestGrade: bestGrade(stored.highestGrade, fromHistory.highestGrade) ?? stored.highestGrade,
    highestScore: Math.max(stored.highestScore ?? 0, fromHistory.highestScore ?? 0),
    maxWpm: Math.max(stored.maxWpm ?? 0, fromHistory.maxWpm ?? 0),
    testBestWpm: Math.max(stored.testBestWpm ?? 0, fromHistory.testBestWpm ?? 0),
    testBestAccuracy: Math.max(stored.testBestAccuracy ?? 0, fromHistory.testBestAccuracy ?? 0),
    testHighestGrade: bestGrade(stored.testHighestGrade, fromHistory.testHighestGrade) ?? stored.testHighestGrade,
    testAttempts: Math.max(stored.testAttempts ?? 0, fromHistory.testAttempts ?? 0),
  };
}

/** Combined performance metrics for mastery tier checks. */
export function getLessonMasteryPerformance(lessonId: string): LessonMasteryPerformance {
  return lessonProgressToPerformance(getLessonProgress(lessonId) ?? undefined);
}

export function getBestAccuracyForLesson(lessonId: string): number | null {
  const stored = getProgress().lessons[lessonId]?.bestAccuracy;
  if (stored != null && stored > 0) return stored;

  let best = 0;
  for (const session of getSessionHistory()) {
    if (session.lessonId !== lessonId) continue;
    best = Math.max(best, session.accuracy);
  }
  return best > 0 ? best : null;
}

function lessonIdsForMasteryLookup(lessonId: string): string[] {
  const resolved = resolveLessonId(lessonId);
  const ids = new Set([resolved, lessonId]);
  for (const [legacy, mapped] of Object.entries(LEGACY_LESSON_ID_MAP)) {
    if (mapped === resolved) ids.add(legacy);
  }
  return [...ids];
}

export function getMasteryXpForLesson(lessonId: string): number {
  let best = 0;
  const history = getSessionHistory();
  const progress = getProgress();

  for (const id of lessonIdsForMasteryLookup(lessonId)) {
    const stored = progress.lessons[id]?.masteryXp ?? 0;
    const fromHistory = accumulateMasteryXpFromSessions(history, id);
    best = Math.max(best, stored, fromHistory);
  }

  return best;
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
