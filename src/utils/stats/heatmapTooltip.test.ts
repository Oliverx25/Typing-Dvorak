import { describe, it, expect } from 'vitest';
import { buildHeatmapTooltipData } from '@/utils/stats/heatmapTooltip';
import type { KeyStatsData } from '@/utils/stats/keyStats';

describe('buildHeatmapTooltipData', () => {
  it('returns the active base row when char-level stats exist', () => {
    const stats: KeyStatsData = {
      hits: { KeyI: 300 },
      misses: { KeyI: 8 },
      charHits: { i: 250, I: 50 },
      charMisses: { i: 6, I: 2 },
    };

    const tooltip = buildHeatmapTooltipData('KeyI', 'i', stats);
    expect(tooltip.headerLabels).toBe('i');
    expect(tooltip.rows).toHaveLength(1);
    expect(tooltip.rows[0]?.kind).toBe('base');
    expect(tooltip.rows[0]?.stats.hits).toBe(250);
  });

  it('returns the active shift row when shift layout is selected', () => {
    const stats: KeyStatsData = {
      hits: { KeyI: 300 },
      misses: { KeyI: 8 },
      charHits: { i: 250, I: 50 },
      charMisses: { i: 6, I: 2 },
    };

    const tooltip = buildHeatmapTooltipData('KeyI', 'i', stats, 'shift');
    expect(tooltip.headerLabels).toBe('I');
    expect(tooltip.rows).toHaveLength(1);
    expect(tooltip.rows[0]?.kind).toBe('shift');
    expect(tooltip.rows[0]?.stats.hits).toBe(50);
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

  it('does not reuse legacy aggregate stats in shift layout', () => {
    const stats: KeyStatsData = {
      hits: { Period: 8 },
      misses: { Period: 0 },
    };

    const tooltip = buildHeatmapTooltipData('Period', '.', stats, 'shift');
    expect(tooltip.headerLabels).toBe('>');
    expect(tooltip.hasData).toBe(false);
    expect(tooltip.rows).toHaveLength(0);
  });

  it('shows no shift stats when only the base character was practiced', () => {
    const stats: KeyStatsData = {
      hits: { Period: 8 },
      misses: { Period: 0 },
      charHits: { '.': 8 },
      charMisses: {},
    };

    const baseTooltip = buildHeatmapTooltipData('Period', '.', stats, 'base');
    const shiftTooltip = buildHeatmapTooltipData('Period', '.', stats, 'shift');

    expect(baseTooltip.hasData).toBe(true);
    expect(baseTooltip.rows[0]?.displayChar).toBe('.');
    expect(shiftTooltip.hasData).toBe(false);
  });
});
