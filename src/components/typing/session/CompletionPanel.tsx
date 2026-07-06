import { useEffect } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { t as translate } from '@/i18n';
import ConsistencyGraph from '@/components/stats/charts/ConsistencyGraph';
import type { KeystrokeLogEntry } from '@/hooks/useTypingSession';
import { GradeScoreRing, AppErrorBoundary } from '@/components/ui';
import { calculateGrade } from '@/utils/grading';
import { calculateMaxScore } from '@/utils/multiplayer/raceScoring';

interface CompletionPanelProps {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  maxCombo?: number;
  isNewRecord?: boolean;
  wpmDelta?: number;
  weakKeys?: string[];
  keystrokeLog?: KeystrokeLogEntry[];
  onRetry: () => void;
  retryButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CompletionPanel({
  wpm,
  accuracy,
  elapsedSeconds,
  maxCombo = 0,
  isNewRecord = false,
  wpmDelta = 0,
  weakKeys = [],
  keystrokeLog = [],
  onRetry,
  retryButtonRef,
}: CompletionPanelProps) {
  const { t, settings } = useApp();
  const isPerfect = accuracy === 100;
  const grade = calculateGrade(accuracy);
  const score = calculateMaxScore(wpm, accuracy, maxCombo);
  const maxScore = Math.max(calculateMaxScore(wpm, 100, maxCombo), score, 1);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <div
        className="absolute inset-0 bg-[var(--color-surface)]/60 backdrop-blur-sm motion-reduce:backdrop-blur-none"
        aria-hidden="true"
      />

      <div className="completion-enter relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 shadow-2xl shadow-black/30 backdrop-blur-md motion-reduce:animate-none">
        <div
          className={[
            'border-b border-[var(--color-border)] px-5 py-4 text-center',
            isPerfect ? 'bg-[var(--color-correct)]/5' : 'bg-[var(--color-highlight)]/5',
          ].join(' ')}
        >
          {isNewRecord ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-key-target)]">
              {t.completion.newRecord}
            </p>
          ) : null}

          <h2 id="completion-title" className="mt-1 text-xl font-bold tracking-tight text-[var(--color-text)]">
            {isPerfect ? t.completion.perfect : t.completion.complete}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {isPerfect ? t.completion.perfectDesc : t.completion.keepGoing}
          </p>

          {wpmDelta > 0 && !isNewRecord ? (
            <p className="mt-1 text-xs text-[var(--color-correct)]">
              {translate(settings.locale, 'completion.improved', { delta: wpmDelta })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-center px-6 py-6">
          <GradeScoreRing
            score={score}
            maxScore={maxScore}
            finalGrade={grade}
            scoreLabel={t.completion.gradeEarned}
            animateKey={`${score}-${grade}`}
            size="md"
          />
        </div>

        <div className="grid grid-cols-3 gap-px border-t border-[var(--color-border)] bg-[var(--color-border)]">
          <div className="bg-[var(--color-surface-elevated)] px-3 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t.typing.wpm}
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-[var(--color-text)]">{wpm}</p>
          </div>
          <div className="bg-[var(--color-surface-elevated)] px-3 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t.typing.accuracy}
            </p>
            <p
              className={[
                'mt-1 font-mono text-xl font-bold',
                accuracy === 100 ? 'text-[var(--color-correct)]' : 'text-[var(--color-text)]',
              ].join(' ')}
            >
              {accuracy}%
            </p>
          </div>
          <div className="bg-[var(--color-surface-elevated)] px-3 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t.typing.time}
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-[var(--color-text)]">
              {formatTime(elapsedSeconds)}
            </p>
          </div>
        </div>

        {keystrokeLog.length > 2 ? (
          <div className="border-t border-[var(--color-border)] px-5 py-4">
            <AppErrorBoundary section="graph">
              <ConsistencyGraph
                data={keystrokeLog}
                title={t.completion.consistencyTitle}
              />
            </AppErrorBoundary>
          </div>
        ) : null}

        {weakKeys.length > 0 ? (
          <div className="border-t border-[var(--color-border)] px-5 py-4">
            <div className="rounded-xl border border-[var(--color-incorrect)]/20 bg-[var(--color-incorrect)]/5 px-4 py-3 text-left">
              <p className="text-center text-xs font-medium text-[var(--color-text-muted)]">{t.completion.weakKeys}</p>
              <div className="mt-2.5 flex justify-center gap-2">
                {weakKeys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--color-incorrect)]/25 bg-[var(--color-surface)] font-mono text-base font-semibold text-[var(--color-incorrect)]"
                  >
                    {key === ' ' ? '␣' : key}
                  </kbd>
                ))}
              </div>
              <p className="mt-2 text-center text-[10px] text-[var(--color-text-muted)]">{t.completion.weakKeysHint}</p>
            </div>
          </div>
        ) : null}

        <div className="border-t border-[var(--color-border)] px-5 py-4">
          <button
            ref={retryButtonRef}
            type="button"
            onClick={onRetry}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-highlight)] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[var(--color-highlight)]/20 transition hover:bg-[var(--color-highlight-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface-elevated)]"
          >
            {t.completion.tryAgain}
            <kbd className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs font-normal text-white/80">
              Enter ↵
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
