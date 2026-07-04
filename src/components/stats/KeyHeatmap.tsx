import { useEffect, useState } from 'react';
import { getKeyStats, hasKeyStats } from '@/utils/stats/keyStats';
import { KEY_STATS_UPDATED_EVENT, SESSION_COMPLETE_EVENT } from '@/utils/app/events';
import { useApp } from '@/contexts/AppProvider';
import { Card } from '@/components/ui';
import HeatmapGrid, { HeatmapLegend } from './HeatmapGrid';

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
  const [stats, setStats] = useState(getKeyStats);

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

  if (!hasKeyStats(stats)) {
    if (emptyMode === 'hide') return null;
    return (
      <Card title={resolvedTitle} description={resolvedDescription} className={className}>
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">{t.stats.heatmapNoData}</p>
      </Card>
    );
  }

  return (
    <Card title={resolvedTitle} description={resolvedDescription} padding="lg" className={className}>
      <HeatmapGrid stats={stats} />
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
