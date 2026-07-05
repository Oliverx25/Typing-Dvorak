import { useApp } from '@/contexts/AppProvider';
import Icon, { type IconName } from '@/components/ui/icons/Icon';
import {
  MODIFIER_ACTIVE_CLASSES,
  MODIFIER_HOVER_CLASSES,
  MODIFIER_ICONS,
  type RaceModifier,
} from '@/utils/multiplayer/roomConfig';

const modifierLabelKeys: Record<
  RaceModifier,
  | 'modifierSuddenDeath'
  | 'modifierBlindMode'
  | 'modifierStrict'
  | 'modifierFlashlight'
  | 'modifierDoubleTime'
  | 'modifierRhythmLock'
> = {
  sudden_death: 'modifierSuddenDeath',
  blind_mode: 'modifierBlindMode',
  strict: 'modifierStrict',
  flashlight: 'modifierFlashlight',
  double_time: 'modifierDoubleTime',
  rhythm_lock: 'modifierRhythmLock',
};

const modifierDescKeys: Record<
  RaceModifier,
  | 'modifierSuddenDeathDesc'
  | 'modifierBlindModeDesc'
  | 'modifierStrictDesc'
  | 'modifierFlashlightDesc'
  | 'modifierDoubleTimeDesc'
  | 'modifierRhythmLockDesc'
> = {
  sudden_death: 'modifierSuddenDeathDesc',
  blind_mode: 'modifierBlindModeDesc',
  strict: 'modifierStrictDesc',
  flashlight: 'modifierFlashlightDesc',
  double_time: 'modifierDoubleTimeDesc',
  rhythm_lock: 'modifierRhythmLockDesc',
};

interface ModifierIconProps {
  modifier: RaceModifier;
  isActive?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function ModifierTooltip({ name, description }: { name: string; description: string }) {
  return (
    <div
      className={[
        'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48',
        '-translate-x-1/2 origin-bottom rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-xl',
        'scale-95 opacity-0 transition-all duration-200',
        'group-hover:scale-100 group-hover:opacity-100 group-hover:delay-150',
      ].join(' ')}
    >
      <p className="whitespace-nowrap text-sm font-semibold text-slate-200">{name}</p>
      <p className="mt-1 text-center text-xs leading-tight text-slate-400">{description}</p>
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
      <div className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
    </div>
  );
}

/** Square icon-only modifier button/badge with semantic colors and custom tooltip. */
export default function ModifierIcon({
  modifier,
  isActive = false,
  readOnly = false,
  disabled = false,
  onClick,
}: ModifierIconProps) {
  const { t } = useApp();
  const name = t.multiplayer[modifierLabelKeys[modifier]];
  const description = t.multiplayer[modifierDescKeys[modifier]];
  const ariaLabel = `${name}: ${description}`;
  const icon = MODIFIER_ICONS[modifier] as IconName;

  const stateClass = isActive
    ? MODIFIER_ACTIVE_CLASSES[modifier]
    : [
        'border-slate-700 bg-transparent text-slate-500',
        !readOnly && !disabled ? MODIFIER_HOVER_CLASSES[modifier] : '',
      ].join(' ');

  const shellClass = [
    'group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-xl transition-all duration-200',
    stateClass,
    disabled ? 'cursor-not-allowed opacity-50' : readOnly ? '' : 'cursor-pointer',
  ].join(' ');

  const content = (
    <>
      <Icon name={icon} size={20} className="text-current" />
      <ModifierTooltip name={name} description={description} />
    </>
  );

  if (readOnly) {
    return (
      <div className={shellClass} aria-label={ariaLabel}>
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
