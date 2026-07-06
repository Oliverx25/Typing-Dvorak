import {
  Scatter,
  ScatterChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';

interface ConsistencyGraphProps {
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

export default function ConsistencyGraph({
  data,
  title = 'Consistencia de pulsaciones',
  xLabel = 'Pulsación',
  yLabel = 'ms entre teclas',
}: ConsistencyGraphProps) {
  if (data.length < 2) return null;

  const points: PlotPoint[] = data
    .filter((entry) => entry.timeSinceLastKey > 0)
    .map((entry) => ({
      index: entry.index,
      ms: entry.timeSinceLastKey,
      isCorrect: entry.isCorrect,
    }));

  if (points.length < 2) return null;

  const maxMs = Math.min(2000, Math.max(...points.map((p) => p.ms), 120));

  return (
    <div className="w-full">
      <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </p>
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <XAxis
              type="number"
              dataKey="index"
              name={xLabel}
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="ms"
              name={yLabel}
              domain={[0, maxMs]}
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload as PlotPoint;
                return (
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1.5 text-xs shadow-lg">
                    <p className="font-mono text-[var(--color-text)]">
                      #{point.index} · {point.ms}ms
                    </p>
                  </div>
                );
              }}
            />
            <Scatter
              data={points.filter((p) => p.isCorrect)}
              fill="var(--color-correct)"
              shape="circle"
              r={3}
            />
            <Scatter
              data={points.filter((p) => !p.isCorrect)}
              fill="var(--color-incorrect)"
              shape="circle"
              r={4}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
