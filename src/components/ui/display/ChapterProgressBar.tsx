interface ChapterProgressBarProps {
  value: number;
  className?: string;
}

/** Compact chapter progress bar used in the lesson library. */
export default function ChapterProgressBar({ value, className = '' }: ChapterProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      className={['h-1 w-full overflow-hidden rounded-full bg-slate-800', className].join(' ')}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-[var(--color-highlight)] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
