import { describe, expect, it } from 'vitest';
import {
  computeGlobalRoadmapProgress,
  computeChapterProgress,
  isRoadmapLessonCompleted,
} from '@/utils/curriculum/roadmapProgress';
import { ROADMAP_LESSON_IDS } from '@/utils/curriculum/roadmapChapters';

describe('roadmapProgress', () => {
  const completed = Object.fromEntries(
    ROADMAP_LESSON_IDS.map((id, index) => [id, { bestAccuracy: index === 0 ? 95 : 0, bestWpm: 40 }]),
  );

  it('counts global progress from completed lessons', () => {
    const pct = computeGlobalRoadmapProgress(completed);
    expect(pct).toBe(Math.round((1 / ROADMAP_LESSON_IDS.length) * 100));
  });

  it('computes chapter progress independently', () => {
    const ch1 = computeChapterProgress('ch1_fundamentals', completed);
    expect(ch1).toBe(33);
  });

  it('marks lesson complete at 90%+ accuracy', () => {
    expect(isRoadmapLessonCompleted('base_vowels', completed)).toBe(true);
    expect(isRoadmapLessonCompleted('base_consonants', completed)).toBe(false);
  });
});
