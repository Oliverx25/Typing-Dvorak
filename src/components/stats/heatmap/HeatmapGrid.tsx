import { useApp } from '@/contexts/AppProvider';
import type { KeyStatsData } from '@/utils/stats/keyStats';
import { HEATMAP_MIN_SAMPLES } from '@/utils/stats/keyStats';
import { getShiftLabel } from '@/utils/keyboard/dvorak';
import OnScreenKeyboard from '@/components/typing/keyboard/OnScreenKeyboard';
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
  const { settings } = useApp();

  return (
    <div className="mx-auto w-full max-w-4xl">
      <OnScreenKeyboard
        hardwareLayout={settings.hardwareLayout}
        renderKey={({ key, className, style, displayLabel }) => {
          if (key.variant === 'gap') {
            return <div key={key.id} style={style} aria-hidden="true" />;
          }

          if (key.variant === 'iso-enter' && key.code) {
            const activeStats = getActiveHeatmapStats(key.code, key.label, stats, layoutMode);
            const background = heatmapBackground(activeStats.accuracy, activeStats.attempts);
            const bootWidth = `calc(${(5 / 6) * 100}% + 2px)`;
            const patchWidth = `${(5 / 6) * 100}%`;

            return (
              <div key={key.id} className="relative z-20" style={style}>
                <div
                  className="relative z-20 flex h-10 w-full items-start justify-center rounded-lg border border-[var(--color-border)] font-mono text-xs sm:h-11 sm:text-sm"
                  style={{ background }}
                >
                  ↵
                </div>
                <div
                  className="absolute right-[-1px] z-30 border-0"
                  style={{
                    top: 'calc(100% - 2px)',
                    width: patchWidth,
                    height: 4,
                    background,
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute top-full right-[-1px] flex items-center justify-center rounded-b-md rounded-t-none border border-t-0 border-[var(--color-border)]"
                  style={{
                    width: bootWidth,
                    height: 'calc(100% + 4px)',
                    background,
                  }}
                  aria-hidden="true"
                />
              </div>
            );
          }

          if (!key.code || key.variant === 'blind') {
            return (
              <div
                key={key.id}
                className={className}
                style={style}
                aria-hidden={key.variant === 'blind'}
              >
                {key.variant === 'iso-enter' ? null : displayLabel}
              </div>
            );
          }

          const activeStats = getActiveHeatmapStats(key.code, key.label, stats, layoutMode);
          const shiftLabel = getShiftLabel(key.label);

          return (
            <HeatmapKey
              key={key.id}
              code={key.code}
              label={key.label}
              displayLabel={layoutMode === 'shift' && shiftLabel ? shiftLabel : displayLabel}
              mode={layoutMode}
              stats={stats}
              containerStyle={style}
              className={className}
              background={heatmapBackground(activeStats.accuracy, activeStats.attempts)}
              tooltipLabels={tooltipLabels}
            />
          );
        }}
      />
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
