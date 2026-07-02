import { describe, expect, it } from 'vitest';
import { isLessonUnlocked, getCurriculumProgress, UNLOCK_ACCURACY } from './curriculum';

describe('curriculum', () => {
  it('always unlocks the first lesson', () => {
    expect(isLessonUnlocked('home-row', {})).toBe(true);
  });

  it('locks lessons until previous is completed with enough accuracy', () => {
    expect(isLessonUnlocked('top-row', {})).toBe(false);
    expect(
      isLessonUnlocked('top-row', {
        'home-row': { bestAccuracy: UNLOCK_ACCURACY },
      }),
    ).toBe(true);
    expect(
      isLessonUnlocked('top-row', {
        'home-row': { bestAccuracy: UNLOCK_ACCURACY - 1 },
      }),
    ).toBe(false);
  });

  it('calculates curriculum progress percentage', () => {
    expect(getCurriculumProgress({})).toBe(0);
    const progress = getCurriculumProgress({
      'home-row': { bestAccuracy: 100 },
    });
    expect(progress).toBeGreaterThan(0);
  });
});
