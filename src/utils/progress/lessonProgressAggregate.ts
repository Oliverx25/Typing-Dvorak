import type { PracticeMode } from '@/utils/app/settings';
import { bestGrade, calculateGrade } from '@/utils/grading';
import { calculateMaxScore } from '@/utils/multiplayer/raceScoring';
import { MULTIPLAYER_LESSON_ID } from '@/utils/stats/sessionDisplay';
import type { LessonProgress, SessionRecord } from '@/utils/progress/storage';

export interface LessonMasteryPerformance {
  bestWpm: number;
  bestAccuracy: number;
  highestGrade: string | null;
  testBestWpm: number;
  testBestAccuracy: number;
  testHighestGrade: string | null;
  testAttempts: number;
}

const EMPTY_PERFORMANCE: LessonMasteryPerformance = {
  bestWpm: 0,
  bestAccuracy: 0,
  highestGrade: null,
  testBestWpm: 0,
  testBestAccuracy: 0,
  testHighestGrade: null,
  testAttempts: 0,
};

function sessionGrade(session: SessionRecord): string {
  return session.grade ?? calculateGrade(session.accuracy);
}

function sessionScore(session: SessionRecord): number {
  return session.score ?? calculateMaxScore(session.wpm, session.accuracy, session.maxCombo ?? 0);
}

/** Merge one session into an existing lesson progress entry. */
export function mergeSessionIntoLessonProgress(
  existing: LessonProgress | undefined,
  session: SessionRecord,
): LessonProgress {
  const grade = sessionGrade(session);
  const score = sessionScore(session);
  const isTest = session.mode === 'test';

  const merged: LessonProgress = {
    bestWpm: Math.max(existing?.bestWpm ?? 0, session.wpm),
    bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, session.accuracy),
    attempts: (existing?.attempts ?? 0) + 1,
    lastPlayedAt:
      !existing || session.completedAt > existing.lastPlayedAt
        ? session.completedAt
        : existing.lastPlayedAt,
    highestGrade: bestGrade(existing?.highestGrade, grade) ?? grade,
    highestScore: Math.max(existing?.highestScore ?? 0, score),
    maxWpm: Math.max(existing?.maxWpm ?? 0, session.wpm),
    masteryXp: existing?.masteryXp,
    testBestWpm: existing?.testBestWpm ?? 0,
    testBestAccuracy: existing?.testBestAccuracy ?? 0,
    testHighestGrade: existing?.testHighestGrade,
    testAttempts: existing?.testAttempts ?? 0,
  };

  if (isTest) {
    merged.testBestWpm = Math.max(existing?.testBestWpm ?? 0, session.wpm);
    merged.testBestAccuracy = Math.max(existing?.testBestAccuracy ?? 0, session.accuracy);
    merged.testHighestGrade = bestGrade(existing?.testHighestGrade, grade) ?? grade;
    merged.testAttempts = (existing?.testAttempts ?? 0) + 1;
  }

  return merged;
}

/** Aggregate lesson progress from a list of sessions (excludes multiplayer). */
export function aggregateLessonsFromSessions(
  sessions: SessionRecord[],
): Record<string, LessonProgress> {
  const lessons: Record<string, LessonProgress> = {};

  for (const session of sessions) {
    if (session.lessonId === MULTIPLAYER_LESSON_ID) continue;
    lessons[session.lessonId] = mergeSessionIntoLessonProgress(lessons[session.lessonId], session);
  }

  return lessons;
}

function maxNumeric(a: number | undefined, b: number): number {
  return Math.max(a ?? 0, b);
}

/** Merge stored progress with session-derived stats (max per field). */
export function mergeLessonProgressEntries(
  stored: LessonProgress | undefined,
  fromSessions: LessonProgress | undefined,
): LessonProgress | undefined {
  if (!stored && !fromSessions) return undefined;

  const base = stored ?? fromSessions!;
  const other = stored && fromSessions ? fromSessions : undefined;
  if (!other) return base;

  return {
    bestWpm: Math.max(base.bestWpm, other.bestWpm),
    bestAccuracy: Math.max(base.bestAccuracy, other.bestAccuracy),
    attempts: Math.max(base.attempts, other.attempts),
    lastPlayedAt: base.lastPlayedAt > other.lastPlayedAt ? base.lastPlayedAt : other.lastPlayedAt,
    highestGrade: bestGrade(base.highestGrade, other.highestGrade) ?? undefined,
    highestScore: Math.max(base.highestScore ?? 0, other.highestScore ?? 0),
    maxWpm: Math.max(base.maxWpm ?? 0, other.maxWpm ?? 0),
    masteryXp: Math.max(base.masteryXp ?? 0, other.masteryXp ?? 0),
    testBestWpm: maxNumeric(base.testBestWpm, other.testBestWpm ?? 0),
    testBestAccuracy: maxNumeric(base.testBestAccuracy, other.testBestAccuracy ?? 0),
    testHighestGrade: bestGrade(base.testHighestGrade, other.testHighestGrade) ?? undefined,
    testAttempts: Math.max(base.testAttempts ?? 0, other.testAttempts ?? 0),
  };
}

/** Extract mastery performance metrics from lesson progress. */
export function lessonProgressToPerformance(
  progress: LessonProgress | undefined,
): LessonMasteryPerformance {
  if (!progress) return { ...EMPTY_PERFORMANCE };

  return {
    bestWpm: progress.bestWpm,
    bestAccuracy: progress.bestAccuracy,
    highestGrade: progress.highestGrade ?? null,
    testBestWpm: progress.testBestWpm ?? 0,
    testBestAccuracy: progress.testBestAccuracy ?? 0,
    testHighestGrade: progress.testHighestGrade ?? null,
    testAttempts: progress.testAttempts ?? 0,
  };
}

/** Cloud row shape for user_lesson_mastery upserts. */
export interface LessonMasteryCloudPayload {
  lesson_id: string;
  mastery_xp: number;
  best_wpm: number;
  best_accuracy: number;
  highest_grade: string | null;
  highest_score: number;
  best_test_wpm: number;
  best_test_accuracy: number;
  best_test_grade: string | null;
  test_attempts: number;
}

export function lessonProgressToCloudPayload(
  lessonId: string,
  progress: LessonProgress,
  masteryXp: number,
): LessonMasteryCloudPayload {
  return {
    lesson_id: lessonId,
    mastery_xp: masteryXp,
    best_wpm: progress.bestWpm,
    best_accuracy: progress.bestAccuracy,
    highest_grade: progress.highestGrade ?? null,
    highest_score: progress.highestScore ?? 0,
    best_test_wpm: progress.testBestWpm ?? 0,
    best_test_accuracy: progress.testBestAccuracy ?? 0,
    best_test_grade: progress.testHighestGrade ?? null,
    test_attempts: progress.testAttempts ?? 0,
  };
}

export function cloudRowToLessonProgress(
  row: LessonMasteryCloudPayload,
): LessonProgress {
  return {
    bestWpm: row.best_wpm,
    bestAccuracy: Number(row.best_accuracy),
    attempts: 0,
    lastPlayedAt: '',
    highestGrade: row.highest_grade ?? undefined,
    highestScore: row.highest_score,
    maxWpm: row.best_wpm,
    masteryXp: row.mastery_xp,
    testBestWpm: row.best_test_wpm,
    testBestAccuracy: Number(row.best_test_accuracy),
    testHighestGrade: row.best_test_grade ?? undefined,
    testAttempts: row.test_attempts,
  };
}

export type { PracticeMode };
