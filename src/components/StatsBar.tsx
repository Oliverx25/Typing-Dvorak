import { useApp } from '../contexts/AppProvider';

interface StatsBarProps {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  progress: number;
  finished?: boolean;
  started?: boolean;
  isTestMode?: boolean;
  timeRemaining?: number;
}

export default function StatsBar({
  wpm,
  accuracy,
  elapsedSeconds,
  progress,
  finished = false,
  started = false,
  isTestMode = false,
  timeRemaining = 0,
}: StatsBarProps) {
  const { t } = useApp();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeDisplay = isTestMode ? formatTime(timeRemaining) : formatTime(elapsedSeconds);
  const timeLabel = isTestMode ? t.lesson.timeRemaining : t.typing.time;

  return (
    <div className="space-y-4" aria-live="polite" aria-atomic="true">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label={t.typing.wpm} value={wpm.toString()} active={started && !finished} success={finished && wpm > 0} />
        <Stat label={t.typing.accuracy} value={`${accuracy}%`} active={started && !finished} success={finished && accuracy === 100} />
        <Stat label={timeLabel} value={timeDisplay} active={started && !finished} urgent={isTestMode && timeRemaining <= 10 && started} />
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className={[
            'h-full rounded-full transition-all duration-300 ease-out',
            finished ? 'bg-[var(--color-correct)]' : isTestMode ? 'bg-[var(--color-key-target)]' : 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)]',
          ].join(' ')}
          style={{ width: `${Math.min(progress, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  active = false,
  success = false,
  urgent = false,
}: {
  label: string;
  value: string;
  active?: boolean;
  success?: boolean;
  urgent?: boolean;
}) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl border px-3 py-3 text-center transition-all duration-300 sm:px-4 sm:py-4',
        urgent ? 'border-[var(--color-incorrect)]/50 bg-[var(--color-incorrect)]/5 animate-pulse motion-reduce:animate-none' : '',
        success ? 'border-[var(--color-correct)]/40 bg-[var(--color-correct)]/5' : '',
        !success && !urgent && active ? 'border-[var(--color-accent)]/30 bg-[var(--color-surface-elevated)] shadow-sm' : '',
        !success && !urgent && !active ? 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]' : '',
      ].join(' ')}
    >
      {active && !urgent && (
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse motion-reduce:animate-none" />
      )}
      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)] sm:text-xs">{label}</p>
      <p className={['mt-1 font-mono text-2xl font-bold sm:text-3xl', success ? 'text-[var(--color-correct)]' : urgent ? 'text-[var(--color-incorrect)]' : 'text-[var(--color-text)]'].join(' ')}>
        {value}
      </p>
    </div>
  );
}
