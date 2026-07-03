import { getAggregateStats, getCompletedLessonsMap, getProgress } from './storage';
import { LESSON_ORDER } from './curriculum';

export interface Badge {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
}

export const BADGES: Badge[] = [
  { id: 'first-lesson', icon: '🎯', titleKey: 'firstLesson', descKey: 'firstLesson' },
  { id: 'streak-7', icon: '🔥', titleKey: 'streak7', descKey: 'streak7' },
  { id: 'wpm-50', icon: '⚡', titleKey: 'wpm50', descKey: 'wpm50' },
  { id: 'perfect-run', icon: '💎', titleKey: 'perfectRun', descKey: 'perfectRun' },
  { id: 'curriculum-done', icon: '🏆', titleKey: 'curriculumDone', descKey: 'curriculumDone' },
];

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

export function checkAndUnlockBadges(stats?: {
  accuracy?: number;
  wpm?: number;
  lessonId?: string;
}): string[] {
  const unlocked = new Set(getUnlockedBadges());
  const newly: string[] = [];

  const progress = getProgress();
  const completed = getCompletedLessonsMap();
  const aggregate = getAggregateStats();

  if (Object.keys(completed).length > 0 && !unlocked.has('first-lesson')) {
    unlocked.add('first-lesson');
    newly.push('first-lesson');
  }

  if (progress.streak >= 7 && !unlocked.has('streak-7')) {
    unlocked.add('streak-7');
    newly.push('streak-7');
  }

  if (aggregate.bestWpm >= 50 && !unlocked.has('wpm-50')) {
    unlocked.add('wpm-50');
    newly.push('wpm-50');
  }

  if (stats?.accuracy === 100 && !unlocked.has('perfect-run')) {
    unlocked.add('perfect-run');
    newly.push('perfect-run');
  }

  const mastered = LESSON_ORDER.filter((id) => completed[id]?.bestAccuracy >= 90).length;
  if (mastered >= LESSON_ORDER.length && !unlocked.has('curriculum-done')) {
    unlocked.add('curriculum-done');
    newly.push('curriculum-done');
  }

  if (newly.length > 0) saveUnlockedBadges([...unlocked]);
  return newly;
}
