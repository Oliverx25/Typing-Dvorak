import { useEffect, useId, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import { useApp } from '@/contexts/AppProvider';
import { Card, Icon } from '@/components/ui';

export interface ChartPoint {
  session: number;
  date: string;
  time: string;
  wpm: number;
  lessonTitle?: string;
}

interface ProgressChartProps {
  data: ChartPoint[];
  emptyLabel?: string;
}

interface ChartColors {
  highlight: string;
  muted: string;
  surface: string;
}

function readChartColors(): ChartColors {
  if (typeof document === 'undefined') {
    return { highlight: '#818cf8', muted: '#94a3b8', surface: '#0f172a' };
  }
  const root = getComputedStyle(document.documentElement);
  return {
    highlight: root.getPropertyValue('--color-highlight').trim() || '#818cf8',
    muted: root.getPropertyValue('--color-text-muted').trim() || '#94a3b8',
    surface: root.getPropertyValue('--color-surface-elevated').trim() || '#0f172a',
  };
}

function ChartTooltip({
  active,
  payload,
  sessionLabel,
  wpmLabel,
}: TooltipContentProps<number, string> & {
  sessionLabel: (session: number) => string;
  wpmLabel: string;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
      <p className="text-[11px] text-slate-400">
        {sessionLabel(point.session)} · {point.date} {point.time}
      </p>
      {point.lessonTitle ? (
        <p className="mt-0.5 max-w-[12rem] truncate text-[11px] text-slate-500">{point.lessonTitle}</p>
      ) : null}
      <p className="mt-1 font-mono text-sm font-semibold text-slate-50">
        {point.wpm} {wpmLabel}
      </p>
    </div>
  );
}

/** WPM history area chart — premium trend view powered by Recharts. */
export default function ProgressChart({ data, emptyLabel }: ProgressChartProps) {
  const { t } = useApp();
  const gradientId = useId().replace(/:/g, '');
  const [colors, setColors] = useState<ChartColors>(() => readChartColors());

  useEffect(() => {
    setColors(readChartColors());
  }, []);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const wpms = data.map((d) => d.wpm);
    const avg = Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length);
    const best = Math.max(...wpms);
    return { avg, best };
  }, [data]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 10] as [number, number];
    const wpms = data.map((d) => d.wpm);
    const min = Math.min(...wpms);
    const max = Math.max(...wpms);
    const range = max - min;
    const pad = range > 0 ? Math.max(range * 0.15, 4) : Math.max(max * 0.2, 8);
    return [Math.max(0, min - pad), max + pad] as [number, number];
  }, [data]);

  const sessionLabel = (session: number) =>
    t.stats.chartSession.replace('{n}', String(session));

  if (data.length === 0 || !stats) {
    return (
      <Card title={t.stats.wpmOverTime}>
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          {emptyLabel ?? t.stats.noData}
        </p>
      </Card>
    );
  }

  return (
    <Card title={t.stats.wpmOverTime} description={t.stats.chartHint} padding="lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <Icon name="chart" size={14} />
          <span>
            {data.length} {t.stats.sessionsRecorded}
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span>
            {t.stats.bestWpm}:{' '}
            <strong className="text-[var(--color-highlight)]">{stats.best}</strong>
          </span>
          <span>
            {t.stats.avgWpm}: <strong className="text-[var(--color-text)]">{stats.avg}</strong>
          </span>
        </div>
      </div>

      <div
        className="rounded-lg border border-[var(--color-border)]/60 bg-[var(--color-surface)]/30 px-1 pt-2"
        role="img"
        aria-label={`${t.stats.wpmOverTime}: ${data.map((d) => `${d.date} ${d.wpm}`).join(', ')}`}
      >
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.highlight} stopOpacity={0.5} />
                <stop offset="95%" stopColor={colors.highlight} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="session"
              type="number"
              domain={[1, data.length]}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.muted, fontSize: 10 }}
              dy={8}
              tickCount={Math.min(data.length, 6)}
              tickFormatter={(session) => {
                const point = data.find((d) => d.session === session);
                return point?.date ?? '';
              }}
            />
            <YAxis hide domain={yDomain} />
            <Tooltip
              cursor={{ stroke: colors.highlight, strokeWidth: 1, strokeDasharray: '4 4' }}
              content={
                <ChartTooltip sessionLabel={sessionLabel} wpmLabel={t.stats.wpm} />
              }
            />
            <Area
              type="monotone"
              dataKey="wpm"
              stroke={colors.highlight}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: colors.highlight,
                stroke: colors.surface,
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
