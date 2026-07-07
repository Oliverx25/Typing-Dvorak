import { describe, expect, it } from 'vitest';
import { computeAllChapterStats, computeChapterStats } from '@/utils/curriculum/chapterStats';
import { ROADMAP_CHAPTERS } from '@/utils/curriculum/roadmapChapters';

describe('chapterStats', () => {
  const completed = {
    base_vowels: { bestAccuracy: 95, bestWpm: 40 },
    base_consonants: { bestAccuracy: 92, bestWpm: 35 },
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
    expect(all.ch1_fundamentals.isLocked).toBe(false);
    expect(all.ch2_top_expansion.isLocked).toBe(true);
  });

  it('unlocks next chapter when previous has progress', () => {
    const partial = { base_vowels: { bestAccuracy: 95, bestWpm: 40 } };
    const all = computeAllChapterStats(partial);
    expect(all.ch2_top_expansion.isLocked).toBe(false);
  });
});
