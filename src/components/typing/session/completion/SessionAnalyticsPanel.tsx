import { memo } from 'react';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';
import { AppErrorBoundary } from '@/components/ui';
import AdvancedMetricsRow from '@/components/typing/session/completion/AdvancedMetricsRow';
import ConsistencyChart from '@/components/typing/session/completion/ConsistencyChart';
import KeystrokeDistribution, {
  type KeystrokeDistributionLabels,
} from '@/components/typing/session/completion/KeystrokeDistribution';

export interface SessionAnalyticsLabels {
  consistencyTitle: string;
  rawWpm: string;
  consistency: string;
  troubleKeys: string;
  noTroubleKeys: string;
  distribution: KeystrokeDistributionLabels;
  chartUnavailable?: string;
}

interface SessionAnalyticsPanelProps {
  wpm: number;
  correctChars: number;
  incorrectChars: number;
  elapsedMs: number;
  keystrokeLog?: KeystrokeLogEntry[];
  weakKeys?: string[];
  stopOnError?: boolean;
  labels: SessionAnalyticsLabels;
}

function SessionAnalyticsPanel({
  wpm,
  correctChars,
  incorrectChars,
  elapsedMs,
  keystrokeLog = [],
  weakKeys = [],
  stopOnError = false,
  labels,
}: SessionAnalyticsPanelProps) {
  const hasGraph = keystrokeLog.length > 2;

  return (
    <AppErrorBoundary section="graph">
      {hasGraph ? (
        <ConsistencyChart data={keystrokeLog} title={labels.consistencyTitle} />
      ) : labels.chartUnavailable ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
          {labels.chartUnavailable}
        </p>
      ) : null}

      {hasGraph ? (
        <>
          <AdvancedMetricsRow
            wpm={wpm}
            correctChars={correctChars}
            incorrectChars={incorrectChars}
            elapsedMs={elapsedMs}
            keystrokeLog={keystrokeLog}
            weakKeys={weakKeys}
            labels={{
              rawWpm: labels.rawWpm,
              consistency: labels.consistency,
              troubleKeys: labels.troubleKeys,
              none: labels.noTroubleKeys,
            }}
          />
          <KeystrokeDistribution
            keystrokeLog={keystrokeLog}
            stopOnError={stopOnError}
            labels={labels.distribution}
          />
        </>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3 dark:border-slate-800/50">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{labels.rawWpm}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">{wpm}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{labels.consistency}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-500">—</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">{labels.troubleKeys}</p>
            <p className="mt-1 text-xs text-slate-500">{labels.noTroubleKeys}</p>
          </div>
        </div>
      )}
    </AppErrorBoundary>
  );
}

export default memo(SessionAnalyticsPanel);
