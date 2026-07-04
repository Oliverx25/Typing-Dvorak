import SvgIcon from '@/components/ui/SvgIcon';

interface ModBadgeProps {
  title: string;
  description: string;
  icon: string;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
}

export default function ModBadge({
  title,
  description,
  icon,
  isActive = false,
  disabled = false,
  readOnly = false,
  onClick,
}: ModBadgeProps) {
  const interactive = !readOnly && Boolean(onClick);

  const body = (
    <>
      <div
        className={[
          'flex w-12 shrink-0 items-center justify-center self-stretch',
          isActive
            ? 'bg-[var(--color-highlight)]/25'
            : 'bg-[var(--color-surface)]/80',
        ].join(' ')}
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <SvgIcon
            src={icon}
            size={20}
            className={
              isActive ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-muted)]'
            }
          />
        </span>
      </div>
      <div
        className={[
          'flex min-w-0 flex-1 flex-col justify-center py-2.5 pr-3 pl-3',
          isActive
            ? 'bg-[var(--color-highlight)]/10'
            : 'bg-[var(--color-surface-elevated)]',
        ].join(' ')}
      >
        <span
          className={[
            'text-sm font-bold leading-tight',
            isActive ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text)]',
          ].join(' ')}
        >
          {title}
        </span>
        <span className="mt-0.5 text-xs leading-snug text-[var(--color-text-muted)]">
          {description}
        </span>
      </div>
    </>
  );

  if (!interactive) {
    return (
      <div
        className={[
          'flex w-full flex-row items-stretch overflow-hidden rounded-md text-left',
          isActive
            ? 'ring-1 ring-[var(--color-highlight)]/50'
            : 'ring-1 ring-[var(--color-border)]',
          readOnly ? 'opacity-90' : '',
        ].join(' ')}
        aria-label={`${title}: ${description}`}
      >
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={`${title}: ${description}`}
      onClick={(event) => {
        onClick?.();
        event.currentTarget.blur();
      }}
      className={[
        'flex w-full flex-row items-stretch overflow-hidden rounded-md text-left transition-transform duration-200',
        isActive
          ? 'ring-1 ring-[var(--color-highlight)]'
          : 'ring-1 ring-[var(--color-border)] hover:ring-[var(--color-highlight)]/40',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-[1.02]',
      ].join(' ')}
    >
      {body}
    </button>
  );
}
