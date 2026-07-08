import { focusRingCardClassName } from '@/utils/a11y/focusRing';
import Icon from '@/components/ui/icons/Icon';

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
        'relative flex h-full flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition',
        focusRingCardClassName,
        isActive
          ? 'border-[var(--color-highlight)] bg-[var(--color-highlight)]/10 shadow-lg shadow-[var(--color-highlight)]/10'
          : 'border-transparent bg-[var(--color-surface-elevated)] hover:-translate-y-0.5 hover:border-[var(--color-highlight)]/50',
        disabled ? 'cursor-not-allowed opacity-50' : '',
      ].join(' ')}
    >
      {isActive ? (
        <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-highlight)] text-white">
          <Icon name="check" size={12} aria-hidden />
        </span>
      ) : null}
      <span
        className={[
          'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          isActive
            ? 'bg-[var(--color-highlight)] text-white'
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
