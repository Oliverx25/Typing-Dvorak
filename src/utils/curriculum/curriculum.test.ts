import { describe, expect, it } from 'vitest';
import { isLessonUnlocked, getCurriculumProgress, UNLOCK_ACCURACY } from '@/utils/curriculum/curriculum';
import { ROADMAP_LESSON_IDS } from '@/utils/curriculum/roadmapChapters';

describe('curriculum', () => {
  it('always unlocks the first lesson', () => {
    expect(isLessonUnlocked('base_vowels', {})).toBe(true);
  });

  it('locks lessons until previous is completed with enough accuracy', () => {
    expect(isLessonUnlocked('base_consonants', {})).toBe(false);
    expect(
      isLessonUnlocked('base_consonants', {
        base_vowels: { bestAccuracy: UNLOCK_ACCURACY },
      }),
    ).toBe(true);
    expect(
      isLessonUnlocked('base_consonants', {
        base_vowels: { bestAccuracy: UNLOCK_ACCURACY - 1 },
      }),
    ).toBe(false);
  });

  it('unlocks lessons sequentially within a chapter', () => {
    expect(isLessonUnlocked('base_alternation', {})).toBe(false);
    expect(
      isLessonUnlocked('base_alternation', {
        base_consonants: { bestAccuracy: UNLOCK_ACCURACY },
      }),
    ).toBe(true);
  });

  it('locks cross-chapter lessons until previous chapter lesson is done', () => {
    expect(isLessonUnlocked('top_left', {})).toBe(false);
    expect(
      isLessonUnlocked('top_left', {
        base_alternation: { bestAccuracy: UNLOCK_ACCURACY },
      }),
    ).toBe(true);
  });

  it('calculates curriculum progress percentage', () => {
    expect(getCurriculumProgress({})).toBe(0);
    const progress = getCurriculumProgress({
      base_vowels: { bestAccuracy: 100 },
    });
    expect(progress).toBe(Math.round((1 / ROADMAP_LESSON_IDS.length) * 100));
  });
});
