import { getShiftLabel } from '@/utils/keyboard/dvorak';
import {
  getCharKeyStats,
  getKeyAccuracy,
  getKeyAttemptCount,
  hasCharKeyStats,
  type CharKeyStats,
  type KeyStatsData,
} from '@/utils/stats/keyStats';

export type HeatmapLayoutMode = 'base' | 'shift';

export interface HeatmapTooltipRow {
  kind: 'base' | 'shift' | 'total';
  char: string;
  displayChar: string;
  stats: CharKeyStats;
}

export interface HeatmapTooltipData {
  headerLabels: string;
  rows: HeatmapTooltipRow[];
  hasData: boolean;
}

export interface ActiveHeatmapStats {
  attempts: number;
  accuracy: number;
}

function displayChar(char: string): string {
  if (char === ' ') return 'Space';
  if (char === '\n') return 'Enter';
  if (char === '\t') return 'Tab';
  return char;
}

function baseCharForLabel(label: string): string {
  if (label === 'Space') return ' ';
  return label;
}

function toRow(
  kind: HeatmapTooltipRow['kind'],
  char: string,
  stats: KeyStatsData,
): HeatmapTooltipRow | null {
  const charStats = getCharKeyStats(char, stats);
  if (charStats.attempts === 0) return null;
  return { kind, char, displayChar: displayChar(char), stats: charStats };
}

/** Builds base/shift breakdown rows for a physical heatmap key. */
export function buildHeatmapTooltipData(
  code: string,
  label: string,
  stats: KeyStatsData,
  mode: HeatmapLayoutMode = 'base',
): HeatmapTooltipData {
  const shiftLabel = getShiftLabel(label);
  const activeChar = mode === 'shift' && shiftLabel ? shiftLabel : baseCharForLabel(label);
  const headerLabels = displayChar(activeChar);

  if (hasCharKeyStats(stats)) {
    const activeRow = toRow(mode === 'shift' && shiftLabel ? 'shift' : 'base', activeChar, stats);
    if (activeRow) {
      return { headerLabels, rows: [activeRow], hasData: true };
    }
    return { headerLabels, rows: [], hasData: false };
  }

  const hits = stats.hits[code] ?? 0;
  const misses = stats.misses[code] ?? 0;
  const attempts = getKeyAttemptCount(code, stats);
  if (attempts === 0) {
    return { headerLabels, rows: [], hasData: false };
  }

  return {
    headerLabels,
    rows: [
      {
        kind: 'total',
        char: baseCharForLabel(label),
        displayChar: label,
        stats: {
          hits,
          misses,
          attempts,
          accuracy: getKeyAccuracy(code, stats),
        },
      },
    ],
    hasData: true,
  };
}

/** Stats used for coloring the currently visible heatmap layout. */
export function getActiveHeatmapStats(
  code: string,
  label: string,
  stats: KeyStatsData,
  mode: HeatmapLayoutMode,
): ActiveHeatmapStats {
  const shiftLabel = getShiftLabel(label);
  const activeChar = mode === 'shift' && shiftLabel ? shiftLabel : baseCharForLabel(label);

  if (hasCharKeyStats(stats)) {
    const charStats = getCharKeyStats(activeChar, stats);
    return {
      attempts: charStats.attempts,
      accuracy: charStats.accuracy,
    };
  }

  return {
    attempts: getKeyAttemptCount(code, stats),
    accuracy: getKeyAccuracy(code, stats),
  };
}
