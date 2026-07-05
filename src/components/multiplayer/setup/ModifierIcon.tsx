import { useApp } from '@/contexts/AppProvider';
import HoverTooltip from '@/components/ui/HoverTooltip';
import Icon, { type IconName } from '@/components/ui/icons/Icon';
import {
  MODIFIER_ACTIVE_CLASSES,
  MODIFIER_DESC_KEYS,
  MODIFIER_HOVER_CLASSES,
  MODIFIER_ICONS,
  MODIFIER_TITLE_KEYS,
  type RaceModifier,
} from '@/utils/multiplayer/roomConfig';

interface ModifierIconProps {
  modifier: RaceModifier;
  isActive?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/** Square icon-only modifier button/badge — styles and i18n keys from roomConfig. */
export default function ModifierIcon({
  modifier,
  isActive = false,
  readOnly = false,
  disabled = false,
  onClick,
}: ModifierIconProps) {
  const { t } = useApp();
  const titleKey = MODIFIER_TITLE_KEYS[modifier];
  const descKey = MODIFIER_DESC_KEYS[modifier];
  const name = t.multiplayer[titleKey as keyof typeof t.multiplayer] as string;
  const description = t.multiplayer[descKey as keyof typeof t.multiplayer] as string;
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
      <HoverTooltip title={name} description={description} />
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
