import { useApp } from '@/contexts/AppProvider';
import Icon, { type IconName } from '@/components/ui/icons/Icon';
import {
  MODIFIER_ACTIVE_CLASSES,
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

/** Square icon-only modifier button/badge with semantic colors and native tooltip. */
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
  const tooltip = `${name}: ${description}`;
  const icon = MODIFIER_ICONS[modifier] as IconName;

  const activeClass = isActive
    ? MODIFIER_ACTIVE_CLASSES[modifier]
    : 'border-slate-700 bg-transparent text-slate-500';

  const shellClass = [
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-xl transition-all duration-200',
    activeClass,
    readOnly ? '' : isActive ? '' : 'hover:border-slate-600 hover:bg-slate-800 hover:text-slate-300',
    disabled ? 'cursor-not-allowed opacity-50' : readOnly ? '' : 'cursor-pointer',
  ].join(' ');

  const iconEl = <Icon name={icon} size={20} className="text-current" />;

  if (readOnly) {
    return (
      <div className={shellClass} title={tooltip} aria-label={tooltip}>
        {iconEl}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={tooltip}
      title={tooltip}
      onClick={(event) => {
        onClick?.();
        event.currentTarget.blur();
      }}
      className={shellClass}
    >
      {iconEl}
    </button>
  );
}
