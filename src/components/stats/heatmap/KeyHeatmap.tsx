import { useEffect, useMemo, useState } from 'react';
import { getKeyStats, hasKeyStats, type KeyStatsData } from '@/utils/stats/keyStats';
import { KEY_STATS_UPDATED_EVENT, SESSION_COMPLETE_EVENT } from '@/utils/app/events';
import { useApp } from '@/contexts/AppProvider';
import { Card, SegmentedControl } from '@/components/ui';
import HeatmapGrid, { HeatmapLegend } from '@/components/stats/heatmap/HeatmapGrid';
import { heatmapTooltipLabelsFromT } from '@/components/stats/heatmap/HeatmapKey';
import type { HeatmapLayoutMode } from '@/utils/stats/heatmapTooltip';

interface KeyHeatmapProps {
  /** When 'hide', returns null if no stats exist (home page). */
  emptyMode?: 'hide' | 'message';
  title?: string;
  description?: string;
  className?: string;
}

/** Key accuracy heatmap — shared by home and stats pages. */
export default function KeyHeatmap({
  emptyMode = 'message',
  title,
  description,
  className = '',
}: KeyHeatmapProps) {
  const { t } = useApp();
  const [stats, setStats] = useState<KeyStatsData>({ hits: {}, misses: {} });
  const [layoutMode, setLayoutMode] = useState<HeatmapLayoutMode>('base');

  useEffect(() => {
    const refresh = () => setStats(getKeyStats());
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    window.addEventListener(KEY_STATS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
      window.removeEventListener(KEY_STATS_UPDATED_EVENT, refresh);
    };
  }, []);

  const resolvedTitle = title ?? t.stats.heatmapTitle;
  const resolvedDescription = description ?? t.stats.heatmapDesc;
  const tooltipLabels = useMemo(() => heatmapTooltipLabelsFromT(t), [t]);
  const layoutOptions = useMemo(
    () => [
      { value: 'base', label: t.stats.heatmapLayoutBase },
      { value: 'shift', label: t.stats.heatmapLayoutShift },
    ] satisfies { value: HeatmapLayoutMode; label: string }[],
    [t],
  );

  if (!hasKeyStats(stats)) {
    if (emptyMode === 'hide') return null;
    return (
      <Card title={resolvedTitle} description={resolvedDescription} className={className}>
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">{t.stats.heatmapNoData}</p>
      </Card>
    );
  }

  return (
    <Card padding="lg" className={className}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{resolvedTitle}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{resolvedDescription}</p>
        </div>
        <SegmentedControl
          options={layoutOptions}
          value={layoutMode}
          onChange={setLayoutMode}
          className="shrink-0 self-start"
        />
      </div>

      <HeatmapGrid stats={stats} tooltipLabels={tooltipLabels} layoutMode={layoutMode} />
      <HeatmapLegend
        noDataLabel={t.home.heatmapNoData}
        goodLabel={t.home.heatmapGood}
        badLabel={t.home.heatmapBad}
      />
    </Card>
  );
}

/** Home page heatmap — hides when no data, uses home copy. */
export function HomeKeyHeatmap() {
  const { t } = useApp();
  return (
    <KeyHeatmap
      emptyMode="hide"
      title={t.home.heatmapTitle}
      description={t.home.heatmapDesc}
      className="mt-12"
    />
  );
}
