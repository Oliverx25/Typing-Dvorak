import { describe, expect, it } from 'vitest';
import { evaluateUnlockedBadges, getBadgeProgressState } from './badges';

const baseInput = {
  completedLessonCount: 0,
  streak: 0,
  bestWpm: 0,
  hasPerfectRun: false,
  masteredLessonCount: 0,
  totalCurriculumLessons: 12,
};

describe('badges', () => {
  it('unlocks first lesson after any completion', () => {
    expect(evaluateUnlockedBadges({ ...baseInput, completedLessonCount: 1 })).toContain('first-lesson');
  });

  it('unlocks streak badge at 7 days', () => {
    expect(evaluateUnlockedBadges({ ...baseInput, streak: 7 })).toContain('streak-7');
  });

  it('unlocks wpm badge at 50', () => {
    expect(evaluateUnlockedBadges({ ...baseInput, bestWpm: 50 })).toContain('wpm-50');
  });

  it('tracks curriculum progress toward graduate badge', () => {
    const progress = getBadgeProgressState('curriculum-done', {
      ...baseInput,
      masteredLessonCount: 6,
    });
    expect(progress).toEqual({ current: 6, target: 12 });
  });
});
