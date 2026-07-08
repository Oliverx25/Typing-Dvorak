import { useCallback, useEffect, useMemo } from 'react';
import { LuX } from 'react-icons/lu';
import { useApp } from '@/contexts/AppProvider';
import { GradeBadge } from '@/components/ui';
import SessionAnalyticsPanel from '@/components/typing/session/completion/SessionAnalyticsPanel';
import {
  estimateCharsFromSession,
  formatHistoryDate,
  formatHistorySessionLabel,
  formatHistorySessionType,
  type HistorySession,
} from '@/utils/history/historySessions';

interface HistorySessionDetailModalProps {
  session: HistorySession;
  onClose: () => void;
}

export default function HistorySessionDetailModal({ session, onClose }: HistorySessionDetailModalProps) {
  const { t, settings } = useApp();
  const locale = settings.locale;

  const title = formatHistorySessionLabel(session, locale);
  const typeLabel = formatHistorySessionType(session, locale);
  const dateLabel = formatHistoryDate(session.completedAt, locale);
  const { correctChars, incorrectChars, elapsedMs } = useMemo(
    () => estimateCharsFromSession(session),
    [session],
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

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--color-surface)]/70 backdrop-blur-sm"
        aria-label={t.history.closeDetails}
        onClick={handleBackdropClick}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{dateLabel}</p>
            <p className="mt-1 text-xs text-slate-400">{typeLabel}</p>
            <h2 className="mt-1 truncate text-lg font-bold text-slate-100">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
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

          <SessionAnalyticsPanel
            wpm={session.wpm}
            correctChars={correctChars}
            incorrectChars={incorrectChars}
            elapsedMs={elapsedMs}
            labels={analyticsLabels}
          />
        </div>
      </div>
    </div>
  );
}
