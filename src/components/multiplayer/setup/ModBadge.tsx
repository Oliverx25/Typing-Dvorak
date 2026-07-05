import SvgIcon from '@/components/ui/icons/SvgIcon';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig';
import { MODIFIER_ACTIVE_CLASSES } from '@/utils/multiplayer/roomConfig';

export type ModBadgeTone = RaceModifier | 'victory';

interface ModBadgeProps {
  title: string;
  description?: string;
  icon: string;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  compact?: boolean;
  tone?: ModBadgeTone;
  onClick?: () => void;
}

function activeClasses(tone: ModBadgeTone | undefined, isActive: boolean): string {
  if (!isActive) {
    return 'border-slate-700 bg-slate-900/40 text-slate-500';
  }
  if (tone && tone !== 'victory' && MODIFIER_ACTIVE_CLASSES[tone]) {
    return MODIFIER_ACTIVE_CLASSES[tone];
  }
  return 'border-[var(--color-highlight)]/40 bg-[var(--color-highlight)]/10 text-[var(--color-highlight)]';
}

function inactiveHover(tone: ModBadgeTone | undefined): string {
  if (tone === 'victory') {
    return 'hover:border-slate-500 hover:text-slate-300';
  }
  return 'hover:border-slate-600 hover:bg-slate-800 hover:text-slate-300';
}

export default function ModBadge({
  title,
  description,
  icon,
  isActive = false,
  disabled = false,
  readOnly = false,
  compact = false,
  tone,
  onClick,
}: ModBadgeProps) {
  const interactive = !readOnly && Boolean(onClick);
  const ariaLabel = description ? `${title}: ${description}` : title;
  const colorClasses = activeClasses(tone, isActive);

  const body = (
    <>
      <div
        className={[
          'flex shrink-0 items-center justify-center self-stretch border-r',
          compact ? 'w-8' : 'w-12',
          colorClasses,
        ].join(' ')}
      >
        <span className={['flex items-center justify-center', compact ? 'h-4 w-4' : 'h-5 w-5'].join(' ')}>
          <SvgIcon
            src={icon}
            size={compact ? 14 : 20}
            className="text-current"
          />
        </span>
      </div>
      <div
        className={[
          'flex min-w-0 flex-1 flex-col justify-center',
          compact ? 'py-1.5 pr-2.5 pl-2' : 'py-2.5 pr-3 pl-3',
          isActive ? colorClasses : 'bg-slate-900/20 text-slate-500',
        ].join(' ')}
      >
        <span
          className={[
            compact ? 'text-xs font-bold leading-tight' : 'text-sm font-bold leading-tight',
            isActive ? 'text-current' : 'text-slate-500',
          ].join(' ')}
        >
          {title}
        </span>
        {description && !compact ? (
          <span className="mt-0.5 text-xs leading-snug text-slate-500">
            {description}
          </span>
        ) : null}
      </div>
    </>
  );

  const shellClass = [
    'flex flex-row items-stretch overflow-hidden rounded-md border text-left',
    compact ? 'inline-flex max-w-full' : 'w-full',
    colorClasses,
  ].join(' ');

  if (!interactive) {
    return (
      <div
        className={[shellClass, readOnly ? 'opacity-90' : ''].join(' ')}
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
        'transition-colors duration-200',
        isActive ? '' : inactiveHover(tone),
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      {body}
    </button>
  );
}
