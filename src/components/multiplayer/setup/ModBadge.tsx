import SvgIcon from '@/components/ui/icons/SvgIcon';

interface ModBadgeProps {
  title: string;
  description?: string;
  icon: string;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function ModBadge({
  title,
  description,
  icon,
  isActive = false,
  disabled = false,
  readOnly = false,
  compact = false,
  onClick,
}: ModBadgeProps) {
  const interactive = !readOnly && Boolean(onClick);
  const ariaLabel = description ? `${title}: ${description}` : title;

  const body = (
    <>
      <div
        className={[
          'flex shrink-0 items-center justify-center self-stretch',
          compact ? 'w-8' : 'w-12',
          isActive
            ? 'bg-[var(--color-highlight)]/25'
            : 'bg-[var(--color-surface)]/80',
        ].join(' ')}
      >
        <span className={['flex items-center justify-center', compact ? 'h-4 w-4' : 'h-5 w-5'].join(' ')}>
          <SvgIcon
            src={icon}
            size={compact ? 14 : 20}
            className={
              isActive ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-muted)]'
            }
          />
        </span>
      </div>
      <div
        className={[
          'flex min-w-0 flex-1 flex-col justify-center',
          compact ? 'py-1.5 pr-2.5 pl-2' : 'py-2.5 pr-3 pl-3',
          isActive
            ? 'bg-[var(--color-highlight)]/10'
            : 'bg-[var(--color-surface-elevated)]',
        ].join(' ')}
      >
        <span
          className={[
            compact ? 'text-xs font-bold leading-tight' : 'text-sm font-bold leading-tight',
            isActive ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text)]',
          ].join(' ')}
        >
          {title}
        </span>
        {description && !compact ? (
          <span className="mt-0.5 text-xs leading-snug text-[var(--color-text-muted)]">
            {description}
          </span>
        ) : null}
      </div>
    </>
  );

  const shellClass = [
    'flex flex-row items-stretch overflow-hidden text-left',
    compact ? 'inline-flex max-w-full' : 'w-full',
    isActive
      ? 'ring-1 ring-[var(--color-highlight)]'
      : 'ring-1 ring-[var(--color-border)]',
  ].join(' ');

  if (!interactive) {
    return (
      <div
        className={[shellClass, 'rounded-md', readOnly ? 'opacity-90' : ''].join(' ')}
        aria-label={ariaLabel}
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
      aria-label={ariaLabel}
      onClick={(event) => {
        onClick?.();
        event.currentTarget.blur();
      }}
      className={[
        shellClass,
        'rounded-md transition-transform duration-200',
        isActive ? '' : 'hover:ring-[var(--color-highlight)]/40',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-[1.02]',
      ].join(' ')}
    >
      {body}
    </button>
  );
}
