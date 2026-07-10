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
  return (
    <button
      type="button"
      onClick={onStart}
      disabled={isLoading}
      className={[
        'group relative mx-auto w-full max-w-3xl cursor-pointer overflow-hidden rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-left outline-none transition-all duration-300',
        'hover:border-[var(--color-highlight)]/50 focus-visible:border-[var(--color-highlight)]/50 focus-visible:ring-4 focus-visible:ring-[var(--color-highlight)]/10',
        isLoading ? 'cursor-wait' : '',
      ].join(' ')}
      aria-label={isLoading ? loadingHint : dirtyHint}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
        aria-hidden="true"
      />

      <div
        className={[
          'relative min-h-[12rem] transition-all duration-300',
          isDirty ? 'blur-md grayscale opacity-50' : '',
        ].join(' ')}
      >
        <p className="font-mono text-lg leading-relaxed text-[var(--color-text-muted)]">
          ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ··· ···
        </p>
      </div>

      {(isDirty || isLoading) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6">
          {isLoading ? (
            <span
              className="size-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-highlight)]"
              aria-hidden="true"
            />
          ) : null}
          <p className="max-w-sm text-center text-sm font-medium text-[var(--color-text)]">
            {isLoading ? loadingHint : dirtyHint}
          </p>
        </div>
      )}
    </button>
  );
}
