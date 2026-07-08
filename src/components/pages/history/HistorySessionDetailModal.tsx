import { useEffect, useMemo, useState } from 'react';
import { LuX } from 'react-icons/lu';
import { useApp } from '@/contexts/AppProvider';
import { GradeBadge, ModalOverlay, useModalRequestClose } from '@/components/ui';
import { fetchSessionTelemetry } from '@/services/supabase/queries';
import SessionAnalyticsPanel from '@/components/typing/session/completion/SessionAnalyticsPanel';
import {
  formatHistoryDate,
  formatHistorySessionLabel,
  formatHistorySessionType,
  getLocalSessionTelemetry,
  isCloudSessionId,
  resolveSessionAnalyticsMetrics,
  type HistorySession,
} from '@/utils/history/historySessions';

interface HistorySessionDetailModalProps {
  session: HistorySession;
  onClose: () => void;
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true">
      <div className="h-[300px] animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg border border-slate-800 bg-slate-900/30"
          />
        ))}
      </div>
    </div>
  );
}

export default function HistorySessionDetailModal({ session, onClose }: HistorySessionDetailModalProps) {
  return (
    <ModalOverlay
      onClose={onClose}
      overlayClassName="z-50"
      backdropClassName="bg-[var(--color-surface)]/70"
      panelClassName="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
    >
      <HistorySessionDetailContent session={session} />
    </ModalOverlay>
  );
}

function HistorySessionDetailContent({ session }: { session: HistorySession }) {
  const requestClose = useModalRequestClose();
  const { t, settings } = useApp();
  const locale = settings.locale;
  const [telemetryLoading, setTelemetryLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<Awaited<ReturnType<typeof fetchSessionTelemetry>>>(null);

  const title = formatHistorySessionLabel(session, locale);
  const typeLabel = formatHistorySessionType(session, locale);
  const dateLabel = formatHistoryDate(session.completedAt, locale);

  useEffect(() => {
    let cancelled = false;
    setTelemetryLoading(true);
    setTelemetry(null);

    const load = async () => {
      const data = isCloudSessionId(session.id)
        ? await fetchSessionTelemetry(session.id)
        : getLocalSessionTelemetry(session.completedAt);

      if (cancelled) return;
      setTelemetry(data);
      setTelemetryLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [session.id, session.completedAt]);

  const metrics = useMemo(
    () => resolveSessionAnalyticsMetrics(session, telemetry),
    [session, telemetry],
  );

  const analyticsLabels = useMemo(
    () => ({
      consistencyTitle: t.completion.consistencyTitle,
      rawWpm: t.completion.rawWpm,
      consistency: t.completion.consistency,
      troubleKeys: t.completion.troubleKeys,
      noTroubleKeys: t.completion.noTroubleKeys,
      chartUnavailable: t.history.chartUnavailable,
      distribution: {
        title: t.completion.keystrokeDistribution,
        correct: t.completion.keystrokesCorrect,
        corrected: t.completion.keystrokesCorrected,
        errors: t.completion.keystrokesErrors,
        notApplicable: t.completion.keystrokesErrorsNa,
      },
    }),
    [t],
  );

  return (
    <>
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{dateLabel}</p>
            <p className="mt-1 text-xs text-slate-400">{typeLabel}</p>
            <h2 className="mt-1 truncate text-lg font-bold text-slate-100">{title}</h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label={t.history.closeDetails}
          >
            <LuX size={18} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <GradeBadge grade={session.grade} className="h-10 w-10 text-base" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {t.typing.wpm}
              </p>
              <p className="font-mono text-2xl font-bold text-slate-100">{session.wpm}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {t.typing.accuracy}
              </p>
              <p className="font-mono text-2xl font-bold text-emerald-400">{session.accuracy}%</p>
            </div>
            {session.score != null ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {t.history.score}
                </p>
                <p className="font-mono text-2xl font-bold text-slate-100">{session.score}</p>
              </div>
            ) : null}
            {session.maxCombo != null && session.maxCombo > 0 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {t.history.maxCombo}
                </p>
                <p className="font-mono text-2xl font-bold text-slate-100">{session.maxCombo}</p>
              </div>
            ) : null}
          </div>

          {telemetryLoading ? (
            <AnalyticsSkeleton />
          ) : (
            <SessionAnalyticsPanel
              wpm={session.wpm}
              correctChars={metrics.correctChars}
              incorrectChars={metrics.incorrectChars}
              elapsedMs={metrics.elapsedMs}
              keystrokeLog={metrics.keystrokeLog}
              weakKeys={metrics.weakKeys}
              stopOnError={metrics.stopOnError}
              labels={analyticsLabels}
            />
          )}
        </div>
    </>
  );
}
