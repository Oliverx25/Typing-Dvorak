import { memo, useMemo } from 'react';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';
import {
  calculateConsistencyScore,
  calculateRawWpm,
  getTroubleKeyBadges,
  type TroubleKeyBadge,
} from '@/utils/typing/completionMetrics';

interface AdvancedMetricsRowProps {
  wpm: number;
  correctChars: number;
  incorrectChars: number;
  elapsedMs: number;
  keystrokeLog: KeystrokeLogEntry[];
  weakKeys: string[];
  labels: {
    rawWpm: string;
    consistency: string;
    troubleKeys: string;
    none: string;
  };
}

function TroubleKeyBadgeView({ badge }: { badge: TroubleKeyBadge }) {
  const toneClass =
    badge.tone === 'error'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-amber-500/20 text-amber-400';

  return (
    <kbd className={['rounded px-2 py-0.5 font-mono text-xs font-semibold', toneClass].join(' ')}>
      {badge.key}
    </kbd>
  );
}

function AdvancedMetricsRow({
  correctChars,
  incorrectChars,
  elapsedMs,
  keystrokeLog,
  weakKeys,
  labels,
}: AdvancedMetricsRowProps) {
  const rawWpm = useMemo(
    () => calculateRawWpm(correctChars, incorrectChars, elapsedMs),
    [correctChars, incorrectChars, elapsedMs],
  );
  const consistency = useMemo(
    () => calculateConsistencyScore(keystrokeLog),
    [keystrokeLog],
  );
  const troubleKeys = useMemo(
    () => getTroubleKeyBadges(keystrokeLog, weakKeys),
    [keystrokeLog, weakKeys],
  );

  return (
    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-800/50 pt-4">
      <div>
        <p className="text-xs text-slate-400">{labels.rawWpm}</p>
        <p className="mt-1 font-mono text-lg font-semibold text-slate-100">{rawWpm}</p>
      </div>
      <div>
        <p className="text-xs text-slate-400">{labels.consistency}</p>
        <p className="mt-1 font-mono text-lg font-semibold text-slate-100">{consistency}%</p>
      </div>
      <div>
        <p className="text-xs text-slate-400">{labels.troubleKeys}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {troubleKeys.length > 0 ? (
            troubleKeys.map((badge) => <TroubleKeyBadgeView key={badge.key} badge={badge} />)
          ) : (
            <span className="text-xs text-slate-500">{labels.none}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AdvancedMetricsRow);
