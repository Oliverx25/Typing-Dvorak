import type { KeyStatsData } from '@/utils/stats/keyStats';
import {
  getKeyAccuracy,
  getKeyAttemptCount,
  HEATMAP_MIN_SAMPLES,
} from '@/utils/stats/keyStats';
import { DVORAK_ROWS } from '@/utils/keyboard/dvorak';

interface HeatmapGridProps {
  stats: KeyStatsData;
  formatKeyTooltip: (
    label: string,
    hits: number,
    misses: number,
    accuracyPct: number,
    attempts: number,
  ) => string;
}

/** Accuracy thresholds (0â1) that drive heatmap key color. */
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

  // Scale red intensity by how far below the 90% neutral floor the key sits.
  const severity = (ACCURACY_NEUTRAL - accuracy) / ACCURACY_NEUTRAL;
  const mix = Math.round(35 + severity * 45);
  return `color-mix(in srgb, var(--color-incorrect) ${mix}%, var(--color-key))`;
}

/** Shared Dvorak keyboard heatmap grid — colors by accuracy (hits / total). */
export default function HeatmapGrid({ stats, formatKeyTooltip }: HeatmapGridProps) {
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
              const hits = stats.hits[key.code] ?? 0;
              const misses = stats.misses[key.code] ?? 0;
              const attempts = getKeyAttemptCount(key.code, stats);
              const accuracy = getKeyAccuracy(key.code, stats);
              const accuracyPct = Math.round(accuracy * 1000) / 10;
              const widthPct = ((key.width ?? 1) / totalUnits) * 100;

              return (
                <div
                  key={key.code}
                  title={formatKeyTooltip(key.label, hits, misses, accuracyPct, attempts)}
                  className="flex h-9 items-center justify-center rounded border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] sm:h-10 sm:text-sm"
                  style={{
                    width: `${widthPct}%`,
                    background: heatmapBackground(accuracy, attempts),
                  }}
                >
                  {key.label}
                </div>
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
