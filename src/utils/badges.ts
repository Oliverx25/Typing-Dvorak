import { getAggregateStats, getCompletedLessonsMap, getProgress, getSessionHistory } from './storage';
import { LESSON_ORDER } from './curriculum';
import { dispatchBadgesUpdated } from './events';

export interface Badge {
  id: string;
  /** Path to the SVG icon in /public/badges. */
  icon: string;
  titleKey: string;
  descKey: string;
}

export const BADGES: Badge[] = [
  { id: 'first-lesson', icon: '/badges/first-lesson.svg', titleKey: 'firstLesson', descKey: 'firstLessonDesc' },
  { id: 'streak-7', icon: '/badges/streak-7.svg', titleKey: 'streak7', descKey: 'streak7Desc' },
  { id: 'wpm-50', icon: '/badges/wpm-50.svg', titleKey: 'wpm50', descKey: 'wpm50Desc' },
  { id: 'perfect-run', icon: '/badges/perfect-run.svg', titleKey: 'perfectRun', descKey: 'perfectRunDesc' },
  { id: 'curriculum-done', icon: '/badges/curriculum-done.svg', titleKey: 'curriculumDone', descKey: 'curriculumDoneDesc' },
];

export interface BadgeEvaluationInput {
  completedLessonCount: number;
  streak: number;
  bestWpm: number;
  hasPerfectRun: boolean;
  masteredLessonCount: number;
  totalCurriculumLessons: number;
}

export interface BadgeProgressState {
  current: number;
  target: number;
}

const BADGES_KEY = 'typing-dvorak-badges';

export function getUnlockedBadges(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveUnlockedBadges(ids: string[]): void {
  localStorage.setItem(BADGES_KEY, JSON.stringify(ids));
}

/** Overwrite unlocked badges (e.g. after cloud load). */
export function replaceUnlockedBadges(ids: string[]): void {
  saveUnlockedBadges(ids);
  dispatchBadgesUpdated();
}

export function buildBadgeEvaluationFromLocal(): BadgeEvaluationInput {
  const progress = getProgress();
  const completed = getCompletedLessonsMap();
  const aggregate = getAggregateStats();
  const hasPerfectRun = getSessionHistory().some((session) => session.accuracy === 100);
  const masteredLessonCount = LESSON_ORDER.filter((id) => (completed[id]?.bestAccuracy ?? 0) >= 90).length;

  return {
    completedLessonCount: Object.keys(completed).length,
    streak: progress.streak,
    bestWpm: aggregate.bestWpm,
    hasPerfectRun,
    masteredLessonCount,
    totalCurriculumLessons: LESSON_ORDER.length,
  };
}

/** Pure evaluation from session-derived stats — same rules for local and cloud. */
export function evaluateUnlockedBadges(input: BadgeEvaluationInput): string[] {
  const unlocked: string[] = [];

  if (input.completedLessonCount > 0) unlocked.push('first-lesson');
  if (input.streak >= 7) unlocked.push('streak-7');
  if (input.bestWpm >= 50) unlocked.push('wpm-50');
  if (input.hasPerfectRun) unlocked.push('perfect-run');
  if (input.masteredLessonCount >= input.totalCurriculumLessons) unlocked.push('curriculum-done');

  return unlocked;
}

export function getBadgeProgressState(
  badgeId: string,
  input: BadgeEvaluationInput,
): BadgeProgressState | null {
  switch (badgeId) {
    case 'first-lesson':
      return { current: Math.min(input.completedLessonCount, 1), target: 1 };
    case 'streak-7':
      return { current: Math.min(input.streak, 7), target: 7 };
    case 'wpm-50':
      return { current: Math.min(input.bestWpm, 50), target: 50 };
    case 'perfect-run':
      return { current: input.hasPerfectRun ? 1 : 0, target: 1 };
    case 'curriculum-done':
      return {
        current: Math.min(input.masteredLessonCount, input.totalCurriculumLessons),
        target: input.totalCurriculumLessons,
      };
    default:
      return null;
  }
}

export function checkAndUnlockBadges(stats?: {
  accuracy?: number;
  wpm?: number;
  lessonId?: string;
}): string[] {
  void stats;
  const input = buildBadgeEvaluationFromLocal();
  const next = evaluateUnlockedBadges(input);
  const previous = new Set(getUnlockedBadges());
  const newly = next.filter((id) => !previous.has(id));

  if (newly.length > 0 || next.length !== previous.size) {
    replaceUnlockedBadges(next);
  }

  return newly;
}
