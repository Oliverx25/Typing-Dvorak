import { memo, useMemo } from 'react';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';
import { calculateKeystrokeDistribution } from '@/utils/typing/completionMetrics';

export interface KeystrokeDistributionLabels {
  title: string;
  correct: string;
  corrected: string;
  errors: string;
  notApplicable: string;
}

interface KeystrokeDistributionProps {
  keystrokeLog: KeystrokeLogEntry[];
  stopOnError?: boolean;
  labels: KeystrokeDistributionLabels;
}

interface DistributionPillProps {
  label: string;
  value: number | null;
  tone: 'emerald' | 'amber' | 'red';
}

const TONE_CLASSES: Record<DistributionPillProps['tone'], string> = {
  emerald: 'bg-emerald-400/10 text-emerald-400',
  amber: 'bg-amber-400/10 text-amber-400',
  red: 'bg-red-500/10 text-red-500',
};

function DistributionPill({ label, value, tone }: DistributionPillProps) {
  const disabled = value === null;

  return (
    <div
      className={[
        'inline-flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-3 py-2',
        disabled ? 'bg-slate-800/40 text-slate-500' : TONE_CLASSES[tone],
      ].join(' ')}
    >
      <span className="truncate text-xs font-medium">{label}</span>
      <span className="shrink-0 font-mono text-sm font-semibold">
        {disabled ? 'N/A' : value}
      </span>
    </div>
  );
}

function KeystrokeDistribution({ keystrokeLog, stopOnError = false, labels }: KeystrokeDistributionProps) {
  const distribution = useMemo(
    () => calculateKeystrokeDistribution(keystrokeLog),
    [keystrokeLog],
  );

  if (keystrokeLog.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-800/50 pt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        {labels.title}
      </p>
      <div className="flex flex-wrap gap-2">
        <DistributionPill label={labels.correct} value={distribution.pureCorrect} tone="emerald" />
        <DistributionPill label={labels.corrected} value={distribution.corrected} tone="amber" />
        <DistributionPill
          label={labels.errors}
          value={stopOnError ? null : distribution.errors}
          tone="red"
        />
      </div>
      {stopOnError ? (
        <p className="mt-2 text-[10px] text-slate-500">{labels.notApplicable}</p>
      ) : null}
    </div>
  );
}

export default memo(KeystrokeDistribution);
