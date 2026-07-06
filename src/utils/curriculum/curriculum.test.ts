import { describe, expect, it } from 'vitest';
import { isLessonUnlocked, getCurriculumProgress, UNLOCK_ACCURACY } from '@/utils/curriculum/curriculum';

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

  it('unlocks first micro-lesson when parent chapter is unlocked', () => {
    expect(isLessonUnlocked('home-left', {})).toBe(true);
    expect(isLessonUnlocked('home-right', {})).toBe(false);
    expect(
      isLessonUnlocked('home-right', {
        'home-left': { bestAccuracy: UNLOCK_ACCURACY },
      }),
    ).toBe(true);
  });

  it('locks micro-lessons until parent chapter is unlocked', () => {
    expect(isLessonUnlocked('top-nivel-1', {})).toBe(false);
    expect(
      isLessonUnlocked('top-nivel-1', {
        'home-row': { bestAccuracy: UNLOCK_ACCURACY },
      }),
    ).toBe(true);
  });

  it('calculates curriculum progress percentage', () => {
    expect(getCurriculumProgress({})).toBe(0);
    const progress = getCurriculumProgress({
      'home-row': { bestAccuracy: 100 },
    });
    expect(progress).toBeGreaterThan(0);
  });
});
