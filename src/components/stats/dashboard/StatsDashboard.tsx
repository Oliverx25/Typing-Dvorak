import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { getAggregateStats, getSessionHistory } from '@/utils/progress/storage';
import { SESSION_COMPLETE_EVENT, KEY_STATS_UPDATED_EVENT } from '@/utils/app/events';
import { buildChartPoints } from '@/utils/stats/sessionDisplay';
import { computeStatsInsights } from '@/utils/stats/statsInsights';
import { Card, CustomDropdown, StreakIcon } from '@/components/ui';
import ActionableInsights from '@/components/stats/dashboard/ActionableInsights';
import LessonStatRow from '@/components/stats/dashboard/LessonStatRow';
import type { ChartPoint } from '@/components/stats/charts/ProgressChart';

const ProgressChart = lazy(() => import('@/components/stats/charts/ProgressChart'));
const KeyHeatmap = lazy(() => import('@/components/stats/heatmap/KeyHeatmap'));

type LessonSortOption = 'wpm-asc' | 'wpm-desc' | 'acc-asc';

export default function StatsDashboard() {
  const { t } = useApp();
  const [aggregate, setAggregate] = useState({ totalSessions: 0, bestWpm: 0, avgAccuracy: 0, streak: 0 });
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [insightsVersion, setInsightsVersion] = useState(0);
  const [sortBy, setSortBy] = useState<LessonSortOption>('wpm-asc');

  const refresh = useCallback(() => {
    setAggregate(getAggregateStats());
    setChartData(buildChartPoints(getSessionHistory(), t, getLessonTitle));
    setInsightsVersion((value) => value + 1);
  }, [t]);

  const insights = useMemo(() => computeStatsInsights(), [insightsVersion]);

  const lessonRows = useMemo(
    () =>
      insights.lessonRows.map((lesson) => ({
        id: lesson.id,
        title: getLessonTitle(t, lesson.titleKey),
        wpm: lesson.wpm,
        accuracy: lesson.accuracy,
        grade: lesson.grade,
      })),
    [insights.lessonRows, t],
  );

  const sortedLessonRows = useMemo(() => {
    const rows = [...lessonRows];
    return rows.sort((a, b) => {
      if (sortBy === 'wpm-desc') return b.wpm - a.wpm;
      if (sortBy === 'acc-asc') return a.accuracy - b.accuracy || a.wpm - b.wpm;
      return a.wpm - b.wpm;
    });
  }, [lessonRows, sortBy]);

  useEffect(() => {
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    window.addEventListener(KEY_STATS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
      window.removeEventListener(KEY_STATS_UPDATED_EVENT, refresh);
    };
  }, [refresh]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label={t.stats.totalSessions} value={String(aggregate.totalSessions)} />
        <SummaryCard label={t.stats.bestWpm} value={String(aggregate.bestWpm)} accent />
        <SummaryCard label={t.stats.avgAccuracy} value={`${aggregate.avgAccuracy}%`} />
        <SummaryCard
          label={t.stats.streak}
          value={String(aggregate.streak)}
          icon={<StreakIcon streak={aggregate.streak} size={32} />}
        />
      </div>

      <Suspense fallback={<ChartSectionSkeleton label={t.stats.wpmOverTime} />}>
        <ProgressChart data={chartData} />
      </Suspense>

      <Suspense fallback={<ChartSectionSkeleton label={t.stats.heatmapTitle} />}>
        <KeyHeatmap />
      </Suspense>

      {lessonRows.length > 0 ? <ActionableInsights insights={insights} /> : null}

      <Card title={t.stats.byLesson} padding="lg" bleed>
        {lessonRows.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-[var(--color-text-muted)]">{t.stats.noData}</p>
        ) : (
          <div>
            <StatsToolbar
              sortBy={sortBy}
              onSortChange={setSortBy}
              title={t.stats.detailedBreakdown}
              sortLabel={t.stats.sortLabel}
              options={{
                wpmAsc: t.stats.sortWpmAsc,
                wpmDesc: t.stats.sortWpmDesc,
                accAsc: t.stats.sortAccAsc,
              }}
            />
            {sortedLessonRows.map((lesson, index) => (
              <LessonStatRow
                key={lesson.id}
                lesson={lesson}
                rowIndex={index}
                maxWpm={insights.maxWpmOverall}
                practiceLabel={t.stats.insights.practice}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatsToolbar({
  sortBy,
  onSortChange,
  title,
  sortLabel,
  options,
}: {
  sortBy: LessonSortOption;
  onSortChange: (value: LessonSortOption) => void;
  title: string;
  sortLabel: string;
  options: {
    wpmAsc: string;
    wpmDesc: string;
    accAsc: string;
  };
}) {
  const sortOptions = [
    { value: 'wpm-asc' as const, label: options.wpmAsc },
    { value: 'wpm-desc' as const, label: options.wpmDesc },
    { value: 'acc-asc' as const, label: options.accAsc },
  ];

  return (
    <div className="mb-4 flex items-center justify-between px-6 text-sm">
      <h3 className="font-medium text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{sortLabel}</span>
        <CustomDropdown
          value={sortBy}
          onChange={onSortChange}
          options={sortOptions}
          aria-label={sortLabel}
        />
      </div>
    </div>
  );
}

function ChartSectionSkeleton({ label }: { label: string }) {
  return (
    <Card title={label}>
      <div className="h-[200px] animate-pulse rounded-lg bg-[var(--color-border)]/40" />
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  accent = false,
  icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Card padding="md" className="text-center">
      <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <p
          className={[
            'font-mono text-3xl font-bold',
            accent ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text)]',
          ].join(' ')}
        >
          {value}
        </p>
        {icon}
      </div>
    </Card>
  );
}
