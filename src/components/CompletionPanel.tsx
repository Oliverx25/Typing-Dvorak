import { useApp } from '../contexts/AppProvider';
import { t as translate } from '../i18n';

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

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[var(--color-surface)]/75 p-4 backdrop-blur-md">
      <div className="completion-enter w-full max-w-sm text-center motion-reduce:animate-none">
        <div
          className={[
            'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full',
            isPerfect ? 'bg-[var(--color-correct)]/15 ring-2 ring-[var(--color-correct)]/30' : 'bg-[var(--color-accent)]/15 ring-2 ring-[var(--color-accent)]/30',
          ].join(' ')}
        >
          {isPerfect ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-correct)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            </svg>
          )}
        </div>

        {isNewRecord && (
          <p className="mb-2 text-sm font-semibold text-[var(--color-key-target)]">{t.completion.newRecord}</p>
        )}

        <h3 className="text-2xl font-bold text-[var(--color-text)]">
          {isPerfect ? t.completion.perfect : t.completion.complete}
        </h3>
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
          {isPerfect ? t.completion.perfectDesc : t.completion.keepGoing}
        </p>

        {wpmDelta > 0 && !isNewRecord && (
          <p className="mt-1 text-xs text-[var(--color-correct)]">
            {translate(settings.locale, 'completion.improved', { delta: wpmDelta })}
          </p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-2">
          <ResultPill label={t.typing.wpm} value={wpm.toString()} highlight={wpm >= 40} />
          <ResultPill label={t.typing.accuracy} value={`${accuracy}%`} highlight={accuracy === 100} />
          <ResultPill label={t.typing.time} value={`${elapsedSeconds}s`} />
        </div>

        {weakKeys.length > 0 && (
          <div className="mt-5 rounded-xl border border-[var(--color-incorrect)]/25 bg-[var(--color-incorrect)]/5 px-4 py-3">
            <p className="text-xs font-medium text-[var(--color-text-muted)]">{t.completion.weakKeys}</p>
            <div className="mt-2 flex justify-center gap-2">
              {weakKeys.map((key) => (
                <kbd
                  key={key}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-surface)] font-mono text-lg font-semibold text-[var(--color-incorrect)]"
                >
                  {key === ' ' ? '␣' : key}
                </kbd>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">{t.completion.weakKeysHint}</p>
          </div>
        )}

        <button
          ref={retryButtonRef}
          type="button"
          onClick={onRetry}
          className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[var(--color-accent)]/25 transition hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]"
        >
          {t.completion.tryAgain}
          <kbd className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs font-normal text-white/80">Enter ↵</kbd>
        </button>
      </div>
    </div>
  );
}

function ResultPill({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={['rounded-xl border px-3 py-3', highlight ? 'border-[var(--color-correct)]/30 bg-[var(--color-correct)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]'].join(' ')}>
      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
      <p className={['mt-0.5 font-mono text-xl font-bold', highlight ? 'text-[var(--color-correct)]' : 'text-[var(--color-text)]'].join(' ')}>{value}</p>
    </div>
  );
}
