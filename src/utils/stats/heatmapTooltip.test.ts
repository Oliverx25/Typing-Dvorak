import { describe, it, expect } from 'vitest';
import { buildHeatmapTooltipData } from '@/utils/stats/heatmapTooltip';
import type { KeyStatsData } from '@/utils/stats/keyStats';

describe('buildHeatmapTooltipData', () => {
  it('returns base and shift rows when char-level stats exist', () => {
    const stats: KeyStatsData = {
      hits: { KeyI: 300 },
      misses: { KeyI: 8 },
      charHits: { i: 250, I: 50 },
      charMisses: { i: 6, I: 2 },
    };

    const tooltip = buildHeatmapTooltipData('KeyI', 'i', stats);
    expect(tooltip.headerLabels).toBe('i / I');
    expect(tooltip.rows).toHaveLength(2);
    expect(tooltip.rows[0]?.kind).toBe('base');
    expect(tooltip.rows[0]?.stats.hits).toBe(250);
    expect(tooltip.rows[1]?.kind).toBe('shift');
    expect(tooltip.rows[1]?.stats.hits).toBe(50);
  });

  it('falls back to aggregated physical-key stats without char breakdown', () => {
    const stats: KeyStatsData = {
      hits: { KeyI: 256 },
      misses: { KeyI: 6 },
    };

    const tooltip = buildHeatmapTooltipData('KeyI', 'i', stats);
    expect(tooltip.rows).toHaveLength(1);
    expect(tooltip.rows[0]?.kind).toBe('total');
    expect(tooltip.rows[0]?.stats.hits).toBe(256);
  });

  it('omits shift row when shift has no attempts', () => {
    const stats: KeyStatsData = {
      hits: { Comma: 20 },
      misses: { Comma: 1 },
      charHits: { ',': 20 },
      charMisses: { ',': 1 },
    };

    const tooltip = buildHeatmapTooltipData('Comma', ',', stats);
    expect(tooltip.rows).toHaveLength(1);
    expect(tooltip.rows[0]?.displayChar).toBe(',');
  });
});
