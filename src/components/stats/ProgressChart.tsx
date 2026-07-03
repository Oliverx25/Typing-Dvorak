import { useApp } from '@/contexts/AppProvider';
import { Card, Icon } from '@/components/ui';

export interface ChartPoint {
  date: string;
  wpm: number;
}

interface ProgressChartProps {
  data: ChartPoint[];
  emptyLabel?: string;
}

/** WPM history chart container — ready for chart library integration. */
export default function ProgressChart({ data, emptyLabel }: ProgressChartProps) {
  const { t } = useApp();
  const maxWpm = Math.max(...data.map((d) => d.wpm), 1);

  if (data.length === 0) {
    return (
      <Card title={t.stats.wpmOverTime}>
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          {emptyLabel ?? t.stats.noData}
        </p>
      </Card>
    );
  }

  return (
    <Card
      title={t.stats.wpmOverTime}
      description={t.stats.chartHint}
      padding="lg"
    >
      <div className="mb-4 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <Icon name="chart" size={14} />
        <span>{data.length} {t.stats.sessionsRecorded}</span>
      </div>

      <div className="flex h-44 items-end gap-1 sm:gap-2" role="img" aria-label={t.stats.wpmOverTime}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{d.wpm}</span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[var(--color-accent)] to-[var(--color-accent)]/60 transition-all duration-300"
              style={{ height: `${(d.wpm / maxWpm) * 100}%`, minHeight: '4px' }}
              title={`${d.date}: ${d.wpm} WPM`}
            />
            <span className="hidden text-[9px] text-[var(--color-text-muted)] sm:block">{d.date}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
