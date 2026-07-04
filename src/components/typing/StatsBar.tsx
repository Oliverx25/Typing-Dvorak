import { useApp } from '@/contexts/AppProvider';
import { StatCard } from '@/components/ui';

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

  const wpmVariant = finished && wpm > 0 ? 'success' : started && !finished ? 'active' : 'default';
  const accuracyVariant =
    finished && accuracy === 100 ? 'success' : started && !finished ? 'active' : 'default';
  const timeVariant =
    isTestMode && timeRemaining <= 10 && started
      ? 'urgent'
      : started && !finished
        ? 'active'
        : 'default';

  return (
    <div className="space-y-4" aria-live="polite" aria-atomic="true">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label={t.typing.wpm} value={wpm.toString()} variant={wpmVariant} />
        <StatCard label={t.typing.accuracy} value={`${accuracy}%`} variant={accuracyVariant} />
        <StatCard label={timeLabel} value={timeDisplay} variant={timeVariant} />
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className={[
            'h-full rounded-full transition-all duration-300 ease-out',
            finished
              ? 'bg-[var(--color-correct)]'
              : isTestMode
                ? 'bg-[var(--color-key-target)]'
                : 'bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-highlight-hover)]',
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
