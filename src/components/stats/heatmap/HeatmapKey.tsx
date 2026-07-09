import { useEffect, useRef, useState } from 'react';
import type { TranslationKey } from '@/i18n';
import type { KeyStatsData } from '@/utils/stats/keyStats';
import { buildHeatmapTooltipData, type HeatmapLayoutMode } from '@/utils/stats/heatmapTooltip';

const HOVER_DELAY_MS = 500;

export interface HeatmapKeyTooltipLabels {
  keyHeader: string;
  baseRow: string;
  shiftRow: string;
  totalRow: string;
  noData: string;
  hits: string;
  errors: string;
}

interface HeatmapKeyProps {
  code: string;
  label: string;
  displayLabel: string;
  mode: HeatmapLayoutMode;
  stats: KeyStatsData;
  widthPct: number;
  background: string;
  tooltipLabels: HeatmapKeyTooltipLabels;
}

export default function HeatmapKey({
  code,
  label,
  displayLabel,
  mode,
  stats,
  widthPct,
  background,
  tooltipLabels,
}: HeatmapKeyProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltip = buildHeatmapTooltipData(code, label, stats, mode);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => setShowTooltip(true), HOVER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
    setShowTooltip(false);
  };

  const rowLabel = (kind: 'base' | 'shift' | 'total', char: string) => {
    if (kind === 'base') return tooltipLabels.baseRow.replace('{char}', char);
    if (kind === 'shift') return tooltipLabels.shiftRow.replace('{char}', char);
    return tooltipLabels.totalRow.replace('{char}', char);
  };

  return (
    <div
      className="relative"
      style={{ width: `${widthPct}%` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="flex h-9 w-full items-center justify-center rounded border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] sm:h-10 sm:text-sm"
        style={{ background }}
      >
        {displayLabel}
      </div>

      {showTooltip ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-slate-200 shadow-xl transition-opacity duration-200"
        >
          <p className="text-center text-sm font-semibold text-slate-100">
            {tooltipLabels.keyHeader.replace('{labels}', tooltip.headerLabels)}
          </p>

          {tooltip.hasData ? (
            <div className="mt-2 space-y-1.5">
              {tooltip.rows.map((row) => (
                <div key={`${row.kind}-${row.char}`} className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                  <span className="font-medium text-slate-300">{rowLabel(row.kind, row.displayChar)}</span>
                  <span className="text-right font-mono text-slate-100">
                    {(row.stats.accuracy * 100).toFixed(1)}%
                  </span>
                  <span className="col-span-2 flex justify-between gap-3 text-[11px] text-slate-400">
                    <span className="text-[var(--color-correct)]">
                      {tooltipLabels.hits.replace('{hits}', String(row.stats.hits))}
                    </span>
                    <span className="text-[var(--color-incorrect)]">
                      {tooltipLabels.errors.replace('{errors}', String(row.stats.misses))}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-center text-[11px] text-slate-400">{tooltipLabels.noData}</p>
          )}

          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
          <div className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      ) : null}
    </div>
  );
}

export function heatmapTooltipLabelsFromT(t: TranslationKey): HeatmapKeyTooltipLabels {
  return {
    keyHeader: t.stats.heatmapTooltipKey,
    baseRow: t.stats.heatmapTooltipBase,
    shiftRow: t.stats.heatmapTooltipShift,
    totalRow: t.stats.heatmapTooltipTotal,
    noData: t.stats.heatmapTooltipNoData,
    hits: t.stats.heatmapTooltipHits,
    errors: t.stats.heatmapTooltipErrors,
  };
}
