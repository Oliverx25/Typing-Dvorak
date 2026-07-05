import Icon, { type IconName } from '@/components/ui/icons/Icon';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig';
import { MODIFIER_ACTIVE_CLASSES } from '@/utils/multiplayer/roomConfig';

export type ModBadgeTone = RaceModifier | 'victory';
export type ModBadgeVariant = 'card' | 'tile' | 'chip';

interface ModBadgeProps {
  title: string;
  description?: string;
  icon: IconName | string;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** @deprecated Use variant="chip" instead */
  compact?: boolean;
  variant?: ModBadgeVariant;
  tone?: ModBadgeTone;
  onClick?: () => void;
}

function activeClasses(tone: ModBadgeTone | undefined, isActive: boolean): string {
  if (!isActive) {
    return 'border-slate-700 bg-transparent text-slate-400';
  }
  if (tone && tone !== 'victory' && MODIFIER_ACTIVE_CLASSES[tone]) {
    return MODIFIER_ACTIVE_CLASSES[tone];
  }
  return 'border-[var(--color-highlight)]/40 bg-[var(--color-highlight)]/10 text-[var(--color-highlight)]';
}

function inactiveHover(variant: ModBadgeVariant, tone: ModBadgeTone | undefined): string {
  if (variant === 'tile' || variant === 'chip') {
    return 'hover:border-slate-600 hover:bg-slate-800 hover:text-slate-300';
  }
  if (tone === 'victory') {
    return 'hover:border-slate-500 hover:text-slate-300';
  }
  return 'hover:border-slate-600 hover:bg-slate-800 hover:text-slate-300';
}

function resolveVariant(compact: boolean, variant?: ModBadgeVariant): ModBadgeVariant {
  if (variant) return variant;
  return compact ? 'chip' : 'card';
}

function ModIcon({ icon, size, className }: { icon: IconName | string; size: number; className?: string }) {
  return <Icon name={icon as IconName} size={size} className={className} />;
}

export default function ModBadge({
  title,
  description,
  icon,
  isActive = false,
  disabled = false,
  readOnly = false,
  compact = false,
  variant,
  tone,
  onClick,
}: ModBadgeProps) {
  const resolvedVariant = resolveVariant(compact, variant);
  const interactive = !readOnly && Boolean(onClick);
  const ariaLabel = description ? `${title}: ${description}` : title;
  const colorClasses = activeClasses(tone, isActive);
  const tooltip = description ?? title;

  if (resolvedVariant === 'tile') {
    const shellClass = [
      'flex w-full min-w-0 items-center justify-center gap-2 rounded-md border p-2 text-left transition-colors duration-200',
      colorClasses,
      isActive ? '' : inactiveHover('tile', tone),
      disabled ? 'cursor-not-allowed opacity-50' : interactive ? 'cursor-pointer' : '',
    ].join(' ');

    const content = (
      <>
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <ModIcon icon={icon} size={16} className="text-current" />
        </span>
        <span className="truncate text-sm font-medium">{title}</span>
      </>
    );

    if (!interactive) {
      return (
        <div className={shellClass} aria-label={ariaLabel} title={tooltip}>
          {content}
        </div>
      );
    }

    return (
      <button
        type="button"
        disabled={disabled}
        aria-pressed={isActive}
        aria-label={ariaLabel}
        title={tooltip}
        onClick={(event) => {
          onClick?.();
          event.currentTarget.blur();
        }}
        className={shellClass}
      >
        {content}
      </button>
    );
  }

  if (resolvedVariant === 'chip') {
    const shellClass = [
      'flex w-full min-w-0 items-center justify-start gap-2 rounded-md border px-3 py-1.5',
      colorClasses,
      readOnly ? 'opacity-90' : '',
    ].join(' ');

    return (
      <div className={shellClass} aria-label={ariaLabel} title={tooltip}>
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <ModIcon icon={icon} size={14} className="text-current" />
        </span>
        <span className="truncate text-xs font-medium">{title}</span>
      </div>
    );
  }

  const body = (
    <>
      <div
        className={[
          'flex shrink-0 items-center justify-center self-stretch border-r',
          'w-12',
          colorClasses,
        ].join(' ')}
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <ModIcon icon={icon} size={20} className="text-current" />
        </span>
      </div>
      <div
        className={[
          'flex min-w-0 flex-1 flex-col justify-center py-2.5 pr-3 pl-3',
          isActive ? colorClasses : 'bg-slate-900/20 text-slate-500',
        ].join(' ')}
      >
        <span
          className={[
            'text-sm font-bold leading-tight',
            isActive ? 'text-current' : 'text-slate-500',
          ].join(' ')}
        >
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 text-xs leading-snug text-slate-500">{description}</span>
        ) : null}
      </div>
    </>
  );

  const shellClass = [
    'flex w-full flex-row items-stretch overflow-hidden rounded-md border text-left',
    colorClasses,
  ].join(' ');

  if (!interactive) {
    return (
      <div
        className={[shellClass, readOnly ? 'opacity-90' : ''].join(' ')}
        aria-label={ariaLabel}
        title={tooltip}
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
      title={tooltip}
      onClick={(event) => {
        onClick?.();
        event.currentTarget.blur();
      }}
      className={[
        shellClass,
        'transition-colors duration-200',
        isActive ? '' : inactiveHover('card', tone),
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      {body}
    </button>
  );
}
