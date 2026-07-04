import SvgIcon from '@/components/ui/SvgIcon';

interface RuleBadgeButtonProps {
  icon: string;
  label: string;
  description: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function RuleBadgeButton({
  icon,
  label,
  description,
  isActive,
  disabled = false,
  onClick,
}: RuleBadgeButtonProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        disabled={disabled}
        aria-pressed={isActive}
        aria-label={`${label}: ${description}`}
        onClick={(event) => {
          onClick();
          event.currentTarget.blur();
        }}
        className={[
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300',
          isActive
            ? 'border-[var(--color-highlight)] bg-[var(--color-highlight)]/10 text-[var(--color-highlight)] ring-1 ring-[var(--color-highlight)]/30'
            : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:border-[var(--color-highlight)]/40 hover:text-[var(--color-text)]',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        ].join(' ')}
      >
        <SvgIcon
          src={icon}
          size={16}
          className={isActive ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-muted)]'}
        />
        <span>{label}</span>
      </button>

      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[12rem] -translate-x-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5 text-center text-[11px] leading-snug text-[var(--color-text-muted)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        <span className="block font-medium text-[var(--color-text)]">{label}</span>
        <span className="mt-0.5 block">{description}</span>
      </div>
    </div>
  );
}
