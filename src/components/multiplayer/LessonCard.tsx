interface LessonCardProps {
  title: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export default function LessonCard({
  title,
  category,
  difficulty,
  isActive,
  disabled = false,
  onSelect,
}: LessonCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isActive}
      onClick={onSelect}
      className={[
        'flex h-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition transform',
        isActive
          ? 'scale-105 border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-2 ring-[var(--color-accent)]/40 shadow-lg shadow-[var(--color-accent)]/10'
          : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50',
        disabled ? 'cursor-not-allowed opacity-50' : '',
      ].join(' ')}
    >
      <span
        className={[
          'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          isActive
            ? 'bg-[var(--color-accent)] text-white'
            : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
        ].join(' ')}
      >
        {category}
      </span>
      <span className="text-sm font-semibold text-[var(--color-text)]">{title}</span>
      <span className="mt-auto text-xs text-[var(--color-text-muted)]">{difficulty}</span>
    </button>
  );
}
