import { useEffect, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { getAggregateStats, getSessionHistory, getBestWpmForLesson } from '@/utils/progress/storage';
import { CORE_LESSONS } from '@/utils/curriculum/lessons';
import { Card, StreakIcon } from '@/components/ui';
import ProgressChart from './ProgressChart';
import KeyHeatmap from './KeyHeatmap';

export default function StatsDashboard() {
  const { t } = useApp();
  const [aggregate, setAggregate] = useState({ totalSessions: 0, bestWpm: 0, avgAccuracy: 0, streak: 0 });
  const [chartData, setChartData] = useState<{ date: string; wpm: number }[]>([]);

  useEffect(() => {
    setAggregate(getAggregateStats());
    const history = getSessionHistory().slice(0, 20).reverse();
    setChartData(
      history.map((r) => ({
        date: new Date(r.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        wpm: r.wpm,
      })),
    );
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label={t.stats.totalSessions} value={String(aggregate.totalSessions)} />
        <SummaryCard label={t.stats.bestWpm} value={String(aggregate.bestWpm)} accent />
        <SummaryCard label={t.stats.avgAccuracy} value={`${aggregate.avgAccuracy}%`} />
        <SummaryCard label={t.stats.streak} value={String(aggregate.streak)} icon={<StreakIcon size={32} />} />
      </div>

      <ProgressChart data={chartData} />

      <KeyHeatmap />

      <Card title={t.stats.byLesson} padding="lg" bleed>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-[var(--color-border)]">
              <th className="px-6 py-3 text-left font-medium text-[var(--color-text-muted)]">{t.stats.lesson}</th>
              <th className="px-6 py-3 text-right font-medium text-[var(--color-text-muted)]">{t.stats.wpm}</th>
            </tr>
          </thead>
          <tbody>
            {CORE_LESSONS.map((lesson) => {
              const best = getBestWpmForLesson(lesson.id);
              if (best === null) return null;
              return (
                <tr key={lesson.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-6 py-3 text-[var(--color-text)]">{getLessonTitle(t, lesson.titleKey)}</td>
                  <td className="px-6 py-3 text-right font-mono font-semibold text-[var(--color-accent)]">{best}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
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
            accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]',
          ].join(' ')}
        >
          {value}
        </p>
        {icon}
      </div>
    </Card>
  );
}
