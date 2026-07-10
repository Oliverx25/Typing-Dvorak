interface ZenTeleprompterProps {
  isDirty: boolean;
  isLoading: boolean;
  dirtyHint: string;
  loadingHint: string;
  onStart: () => void;
}

export default function ZenTeleprompter({
  isDirty,
  isLoading,
  dirtyHint,
  loadingHint,
  onStart,
}: ZenTeleprompterProps) {
  const hint = isLoading ? loadingHint : dirtyHint;

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <button
        type="button"
        onClick={onStart}
        disabled={isLoading}
        className={[
          'w-full cursor-pointer rounded-lg bg-transparent p-4 outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]',
          isLoading ? 'cursor-wait' : '',
        ].join(' ')}
        aria-label={hint}
      >
        <div
          className={[
            'relative min-h-[10rem] transition-all duration-300',
            isDirty || isLoading ? 'blur-sm opacity-50' : '',
          ].join(' ')}
        >
          <p className="text-center font-mono text-xl leading-relaxed text-slate-400 dark:text-slate-600">
            ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ···
          </p>
        </div>
      </button>

      {(isDirty || isLoading) && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6">
          {isLoading ? (
            <span
              className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--color-highlight)] dark:border-slate-700"
              aria-hidden="true"
            />
          ) : null}
          <p className="w-full text-center text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
      )}
    </div>
  );
}
