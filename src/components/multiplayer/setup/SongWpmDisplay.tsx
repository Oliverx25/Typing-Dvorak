interface SongWpmDisplayProps {
  avgWpm: number | null;
  maxWpm: number | null;
  wpmUnit?: string;
  className?: string;
}

/** Compact AVG | MAX WPM row for song cards. */
export default function SongWpmDisplay({
  avgWpm,
  maxWpm,
  wpmUnit = 'WPM',
  className = '',
}: SongWpmDisplayProps) {
  if (avgWpm === null && maxWpm === null) return null;

  return (
    <div
      className={[
        'flex items-center gap-2 font-mono text-xs',
        className,
      ].join(' ')}
    >
      {avgWpm !== null ? (
        <>
          <span className="text-slate-500 dark:text-slate-400">AVG</span>
          <span className="text-slate-700 dark:text-slate-200">{avgWpm}</span>
        </>
      ) : null}
      {avgWpm !== null && maxWpm !== null ? (
        <span className="text-slate-300 dark:text-slate-600">|</span>
      ) : null}
      {maxWpm !== null ? (
        <>
          <span className="text-slate-500 dark:text-slate-400">MAX</span>
          <span className="text-amber-600 dark:text-amber-400">{maxWpm}</span>
        </>
      ) : null}
      <span className="text-slate-500">{wpmUnit}</span>
    </div>
  );
}
