import { describe, expect, it } from 'vitest';
import {
  buildLessonInsightRows,
  getTroubleKeysFromHeatmap,
  TROUBLE_KEY_ACCURACY_THRESHOLD,
} from '@/utils/stats/statsInsights';
import type { KeyStatsData } from '@/utils/stats/keyStats';

describe('getTroubleKeysFromHeatmap', () => {
  it('returns keys below accuracy threshold with enough samples', () => {
    const stats: KeyStatsData = {
      hits: { KeyA: 4, KeyS: 9 },
      misses: { KeyA: 6, KeyS: 1 },
    };
    const trouble = getTroubleKeysFromHeatmap(stats, 5, TROUBLE_KEY_ACCURACY_THRESHOLD);
    expect(trouble).toContain('a');
    expect(trouble).not.toContain('s');
  });
});

describe('buildLessonInsightRows', () => {
  it('returns an array (empty when no local progress)', () => {
    expect(Array.isArray(buildLessonInsightRows())).toBe(true);
  });
});
