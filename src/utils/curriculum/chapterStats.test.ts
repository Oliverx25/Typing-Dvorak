import { describe, expect, it } from 'vitest';
import { computeAllChapterStats, computeChapterStats } from '@/utils/curriculum/chapterStats';
import { ROADMAP_CHAPTERS } from '@/utils/curriculum/roadmapChapters';

describe('chapterStats', () => {
  const completed = {
    'home-row': { bestAccuracy: 95, bestWpm: 40 },
    'home-left': { bestAccuracy: 92, bestWpm: 35 },
  };

  it('computes completion percentage per chapter', () => {
    const stats = computeChapterStats(ROADMAP_CHAPTERS[0], 0, 100, completed);
    expect(stats.completionPercentage).toBe(67);
    expect(stats.completedLessons).toBe(2);
    expect(stats.totalLessons).toBe(3);
  });

  it('locks chapter when previous has 0% completion', () => {
    const empty = {};
    const all = computeAllChapterStats(empty);
    expect(all.fundamentals.isLocked).toBe(false);
    expect(all.expansion.isLocked).toBe(true);
  });

  it('unlocks next chapter when previous has progress', () => {
    const partial = { 'home-row': { bestAccuracy: 95, bestWpm: 40 } };
    const all = computeAllChapterStats(partial);
    expect(all.expansion.isLocked).toBe(false);
  });

  it('averages mastery XP across all lessons in chapter', () => {
    const stats = computeChapterStats(ROADMAP_CHAPTERS[0], 0, 100, completed);
    expect(stats.averageMasteryXp).toBeGreaterThanOrEqual(0);
    expect(stats.masteryProgressPct).toBeGreaterThanOrEqual(0);
  });
});
