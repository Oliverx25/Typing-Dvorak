import { memo, useMemo } from 'react';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';
import { averageKeystrokeDelta } from '@/utils/typing/completionMetrics';

interface ConsistencyChartProps {
  data: KeystrokeLogEntry[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

interface PlotPoint {
  index: number;
  ms: number;
  isCorrect: boolean;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PlotPoint }>;
}

const ConsistencyTooltip = memo(function ConsistencyTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-900/95 px-3 py-2 text-xs shadow-xl shadow-black/40">
      <p className="font-mono text-slate-100">
        #{point.index} · {point.ms}ms
      </p>
      <p className={point.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
        {point.isCorrect ? 'Correct' : 'Error'}
      </p>
    </div>
  );
});

function ConsistencyChart({
  data,
  title = 'Keystroke consistency',
  xLabel = 'Keystroke',
  yLabel = 'ms between keys',
}: ConsistencyChartProps) {
  const { points, maxMs, averageDelta } = useMemo(() => {
    const plotPoints: PlotPoint[] = data
      .filter((entry) => entry.timeSinceLastKey > 0)
      .map((entry) => ({
        index: entry.index,
        ms: entry.timeSinceLastKey,
        isCorrect: entry.isCorrect,
      }));

    const peakMs = plotPoints.length > 0 ? Math.max(...plotPoints.map((point) => point.ms), 120) : 120;

    return {
      points: plotPoints,
      maxMs: Math.min(2000, peakMs),
      averageDelta: averageKeystrokeDelta(data),
    };
  }, [data]);

  if (points.length < 2) return null;

  return (
    <div className="w-full">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.5)" vertical={false} />
            <XAxis
              type="number"
              dataKey="index"
              name={xLabel}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: 'rgba(51, 65, 85, 0.5)' }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="ms"
              name={yLabel}
              domain={[0, maxMs]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: 'rgba(51, 65, 85, 0.5)' }}
              tickLine={false}
              width={40}
            />
            {averageDelta > 0 ? (
              <ReferenceLine
                y={averageDelta}
                stroke="rgba(148, 163, 184, 0.5)"
                strokeDasharray="3 3"
                label={{
                  position: 'insideTopLeft',
                  value: 'AVG',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
            ) : null}
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ConsistencyTooltip />} />
            <Scatter
              data={points.filter((point) => point.isCorrect)}
              fill="#34d399"
              shape="circle"
              r={3}
            />
            <Scatter
              data={points.filter((point) => !point.isCorrect)}
              fill="#ef4444"
              shape="circle"
              r={4}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(ConsistencyChart);
