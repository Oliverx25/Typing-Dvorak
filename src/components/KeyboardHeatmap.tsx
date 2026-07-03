import { useEffect, useState } from 'react';
import { DVORAK_ROWS } from '../utils/dvorak';
import { getKeyStats, getKeyErrorRate, hasKeyStats } from '../utils/keyStats';
import { useApp } from '../contexts/AppProvider';

export default function KeyboardHeatmap() {
  const { t } = useApp();
  const [stats, setStats] = useState(getKeyStats());

  useEffect(() => {
    setStats(getKeyStats());
  }, []);

  if (!hasKeyStats(stats)) return null;

  return (
    <section className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 sm:p-6">
      <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">{t.home.heatmapTitle}</h2>
      <p className="mb-5 text-sm text-[var(--color-text-muted)]">{t.home.heatmapDesc}</p>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-1">
        {DVORAK_ROWS.map((row, rowIndex) => {
          const totalUnits = row.keys.reduce((s, k) => s + (k.width ?? 1), 0);
          return (
            <div
              key={rowIndex}
              className="flex w-full justify-center gap-0.5"
              style={{ paddingLeft: `${(row.indent ?? 0) * 3}%` }}
            >
              {row.keys.map((key) => {
                const errorRate = getKeyErrorRate(key.code, stats);
                const hits = stats.hits[key.code] ?? 0;
                const misses = stats.misses[key.code] ?? 0;
                const widthPct = ((key.width ?? 1) / totalUnits) * 100;

                const bg =
                  hits + misses === 0
                    ? 'var(--color-key)'
                    : errorRate === 0
                      ? 'color-mix(in srgb, var(--color-correct) 35%, var(--color-key))'
                      : `color-mix(in srgb, var(--color-incorrect) ${Math.round(errorRate * 70 + 10)}%, var(--color-key))`;

                return (
                  <div
                    key={key.code}
                    title={`${key.label}: ${misses} errors / ${hits + misses} total`}
                    className="flex h-9 items-center justify-center rounded border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] sm:h-10 sm:text-sm"
                    style={{ width: `${widthPct}%`, background: bg }}
                  >
                    {key.label}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-4 text-xs text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[var(--color-border)] bg-[var(--color-key)]" />
          {t.home.heatmapNoData}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[var(--color-correct)]/40" />
          {t.home.heatmapGood}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[var(--color-incorrect)]/50" />
          {t.home.heatmapBad}
        </span>
      </div>
    </section>
  );
}
