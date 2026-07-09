import { getShiftLabel } from '@/utils/keyboard/dvorak';
import {
  getCharKeyStats,
  getKeyAccuracy,
  getKeyAttemptCount,
  hasCharKeyStats,
  type CharKeyStats,
  type KeyStatsData,
} from '@/utils/stats/keyStats';

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
): HeatmapTooltipData {
  const shiftLabel = getShiftLabel(label);
  const headerLabels = shiftLabel ? `${label} / ${shiftLabel}` : label;

  if (hasCharKeyStats(stats)) {
    const baseChar = baseCharForLabel(label);
    const rows: HeatmapTooltipRow[] = [];
    const baseRow = toRow('base', baseChar, stats);
    const shiftRow = shiftLabel ? toRow('shift', shiftLabel, stats) : null;
    if (baseRow) rows.push(baseRow);
    if (shiftRow) rows.push(shiftRow);

    if (rows.length > 0) {
      return { headerLabels, rows, hasData: true };
    }
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
