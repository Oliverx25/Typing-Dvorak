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
    const fundamentals = computeChapterProgress('fundamentals', completed);
    expect(fundamentals).toBe(33);
  });

  it('marks lesson complete at 90%+ accuracy', () => {
    expect(isRoadmapLessonCompleted('home-row', completed)).toBe(true);
    expect(isRoadmapLessonCompleted('home-left', completed)).toBe(false);
  });
});
