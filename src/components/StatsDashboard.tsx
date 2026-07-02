import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppProvider';
import { getAggregateStats, getSessionHistory } from '../utils/storage';
import { LESSONS } from '../utils/lessons';
import { getLessonTitle } from '../contexts/AppProvider';
import { getBestWpmForLesson } from '../utils/storage';

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

  const maxWpm = Math.max(...chartData.map((d) => d.wpm), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label={t.stats.totalSessions} value={String(aggregate.totalSessions)} />
        <SummaryCard label={t.stats.bestWpm} value={String(aggregate.bestWpm)} accent />
        <SummaryCard label={t.stats.avgAccuracy} value={`${aggregate.avgAccuracy}%`} />
        <SummaryCard label={t.stats.streak} value={`${aggregate.streak} 🔥`} />
      </div>

      {chartData.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">{t.stats.wpmOverTime}</h2>
          <div className="flex h-40 items-end gap-1 sm:gap-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{d.wpm}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[var(--color-accent)] to-[var(--color-accent)]/60 transition-all"
                  style={{ height: `${(d.wpm / maxWpm) * 100}%`, minHeight: '4px' }}
                  title={`${d.date}: ${d.wpm} WPM`}
                />
                <span className="hidden text-[9px] text-[var(--color-text-muted)] sm:block">{d.date}</span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-center text-[var(--color-text-muted)]">
          {t.stats.noData}
        </p>
      )}

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
        <h2 className="border-b border-[var(--color-border)] px-6 py-4 text-lg font-semibold text-[var(--color-text)]">
          {t.stats.byLesson}
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-6 py-3 text-left font-medium text-[var(--color-text-muted)]">{t.stats.lesson}</th>
              <th className="px-6 py-3 text-right font-medium text-[var(--color-text-muted)]">{t.stats.wpm}</th>
            </tr>
          </thead>
          <tbody>
            {LESSONS.map((lesson) => {
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
      </section>
    </div>
  );
}

function SummaryCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-5 text-center">
      <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
      <p className={['mt-2 font-mono text-3xl font-bold', accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'].join(' ')}>
        {value}
      </p>
    </div>
  );
}
