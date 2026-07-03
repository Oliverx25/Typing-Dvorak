import { useEffect } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { t as translate } from '@/i18n';
import { StarRating, StatCard } from '@/components/ui';

interface CompletionPanelProps {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  isNewRecord?: boolean;
  wpmDelta?: number;
  weakKeys?: string[];
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
  isNewRecord = false,
  wpmDelta = 0,
  weakKeys = [],
  onRetry,
  retryButtonRef,
}: CompletionPanelProps) {
  const { t, settings } = useApp();
  const isPerfect = accuracy === 100;

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--color-surface)]/60 backdrop-blur-sm motion-reduce:backdrop-blur-none"
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="completion-enter relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl shadow-black/20 motion-reduce:animate-none">
        <div
          className={[
            'h-1 w-full',
            isPerfect
              ? 'bg-gradient-to-r from-[var(--color-correct)] to-[var(--color-correct)]/50'
              : 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/50',
          ].join(' ')}
          aria-hidden="true"
        />

        <div className="px-6 py-8 text-center sm:px-8">
          <div
            className={[
              'mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full',
              isPerfect
                ? 'bg-[var(--color-correct)]/15 ring-2 ring-[var(--color-correct)]/30'
                : 'bg-[var(--color-accent)]/15 ring-2 ring-[var(--color-accent)]/30',
            ].join(' ')}
          >
            {isPerfect ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-correct)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              </svg>
            )}
          </div>

          {isNewRecord && (
            <p className="mb-2 text-sm font-semibold text-[var(--color-key-target)]">{t.completion.newRecord}</p>
          )}

          <h2 id="completion-title" className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {isPerfect ? t.completion.perfect : t.completion.complete}
          </h2>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            {isPerfect ? t.completion.perfectDesc : t.completion.keepGoing}
          </p>

          {wpmDelta > 0 && !isNewRecord && (
            <p className="mt-1 text-xs text-[var(--color-correct)]">
              {translate(settings.locale, 'completion.improved', { delta: wpmDelta })}
            </p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatCard label={t.typing.wpm} value={wpm.toString()} variant={wpm >= 40 ? 'highlight' : 'default'} size="lg" />
            <StatCard label={t.typing.accuracy} value={`${accuracy}%`} variant={accuracy === 100 ? 'highlight' : 'default'} size="lg" />
            <StatCard label={t.typing.time} value={formatTime(elapsedSeconds)} size="lg" />
          </div>

          <div className="mt-5">
            <StarRating accuracy={accuracy} wpm={wpm} label={t.completion.starsEarned} />
          </div>

          {weakKeys.length > 0 && (
            <div className="mt-5 rounded-xl border border-[var(--color-incorrect)]/20 bg-[var(--color-incorrect)]/5 px-4 py-3 text-left">
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
          )}

          <button
            ref={retryButtonRef}
            type="button"
            onClick={onRetry}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[var(--color-accent)]/20 transition hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface-elevated)]"
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
