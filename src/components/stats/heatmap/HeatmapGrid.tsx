import type { KeyStatsData } from '@/utils/stats/keyStats';
import {
  HEATMAP_MIN_SAMPLES,
} from '@/utils/stats/keyStats';
import { DVORAK_ROWS, getShiftLabel } from '@/utils/keyboard/dvorak';
import HeatmapKey, { type HeatmapKeyTooltipLabels } from '@/components/stats/heatmap/HeatmapKey';
import { getActiveHeatmapStats, type HeatmapLayoutMode } from '@/utils/stats/heatmapTooltip';

interface HeatmapGridProps {
  stats: KeyStatsData;
  tooltipLabels: HeatmapKeyTooltipLabels;
  layoutMode: HeatmapLayoutMode;
}

/** Accuracy thresholds (0-1) that drive heatmap key color. */
const ACCURACY_MASTERED = 0.95;
const ACCURACY_NEUTRAL = 0.9;

/** Colors a key strictly by accuracy ratio; low-sample keys stay neutral. */
function heatmapBackground(accuracy: number, attempts: number): string {
  if (attempts < HEATMAP_MIN_SAMPLES) return 'var(--color-key)';

  if (accuracy >= ACCURACY_MASTERED) {
    return 'color-mix(in srgb, var(--color-correct) 40%, var(--color-key))';
  }

  if (accuracy >= ACCURACY_NEUTRAL) {
    return 'color-mix(in srgb, var(--color-key-target) 45%, var(--color-key))';
  }

  const severity = (ACCURACY_NEUTRAL - accuracy) / ACCURACY_NEUTRAL;
  const mix = Math.round(35 + severity * 45);
  return `color-mix(in srgb, var(--color-incorrect) ${mix}%, var(--color-key))`;
}

/** Shared Dvorak keyboard heatmap grid — colors by accuracy (hits / total). */
export default function HeatmapGrid({ stats, tooltipLabels, layoutMode }: HeatmapGridProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-1">
      {DVORAK_ROWS.map((row, rowIndex) => {
        const totalUnits = row.keys.reduce((s, k) => s + (k.width ?? 1), 0);
        return (
          <div
            key={rowIndex}
            className="flex w-full justify-center gap-0.5"
            style={{ paddingLeft: `${(row.indent ?? 0) * 3}%` }}
          >
            {row.keys.map((key) => {
              const activeStats = getActiveHeatmapStats(key.code, key.label, stats, layoutMode);
              const widthPct = ((key.width ?? 1) / totalUnits) * 100;
              const shiftLabel = getShiftLabel(key.label);
              const displayLabel = layoutMode === 'shift' && shiftLabel ? shiftLabel : key.label;

              return (
                <HeatmapKey
                  key={key.code}
                  code={key.code}
                  label={key.label}
                  displayLabel={displayLabel}
                  mode={layoutMode}
                  stats={stats}
                  widthPct={widthPct}
                  background={heatmapBackground(activeStats.accuracy, activeStats.attempts)}
                  tooltipLabels={tooltipLabels}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function HeatmapLegend({
  noDataLabel,
  goodLabel,
  badLabel,
}: {
  noDataLabel: string;
  goodLabel: string;
  badLabel: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-[var(--color-text-muted)]">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-[var(--color-border)] bg-[var(--color-key)]" />
        {noDataLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-[var(--color-correct)]/40" />
        {goodLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-[var(--color-incorrect)]/50" />
        {badLabel}
      </span>
    </div>
  );
}
