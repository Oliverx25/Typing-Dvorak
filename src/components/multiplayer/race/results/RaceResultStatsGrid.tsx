import { memo } from 'react';

export interface RaceResultStats {
  accuracy: number;
  maxCombo: number;
  wpm: number;
  pureCorrect: number;
  corrected: number;
  errors: number;
}

interface RaceResultStatsGridProps {
  stats: RaceResultStats;
  accuracyLabel: string;
  maxComboLabel: string;
  wpmLabel: string;
  correctLabel: string;
  correctedLabel: string;
  errorsLabel: string;
}

function StatCell({
  label,
  value,
  valueClassName = 'text-white',
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-medium uppercase tracking-widest text-white/50">{label}</p>
      <p className={`mt-1 font-mono text-xl font-medium tabular-nums ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function RaceResultStatsGrid({
  stats,
  accuracyLabel,
  maxComboLabel,
  wpmLabel,
  correctLabel,
  correctedLabel,
  errorsLabel,
}: RaceResultStatsGridProps) {
  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-3 text-center">
        <StatCell label={accuracyLabel} value={`${stats.accuracy.toFixed(1)}%`} valueClassName="text-emerald-300" />
        <StatCell label={maxComboLabel} value={stats.maxCombo} />
        <StatCell label={wpmLabel} value={Math.round(stats.wpm)} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <StatCell label={correctLabel} value={stats.pureCorrect} valueClassName="text-emerald-400" />
        <StatCell label={correctedLabel} value={stats.corrected} valueClassName="text-amber-400" />
        <StatCell label={errorsLabel} value={stats.errors} valueClassName="text-red-500" />
      </div>
    </div>
  );
}

export default memo(RaceResultStatsGrid);
