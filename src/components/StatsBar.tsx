interface StatsBarProps {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  progress: number;
}

export default function StatsBar({ wpm, accuracy, elapsedSeconds, progress }: StatsBarProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="WPM" value={wpm.toString()} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Time" value={formatTime(elapsedSeconds)} />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-200"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-center">
      <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}
