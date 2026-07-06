import Icon from '@/components/ui/icons/Icon';
import type { OffScreenDirection } from '@/utils/typing/teleprompterLines';
import type { PacingCursorVariant } from '@/components/typing/session/PacingCursorMarker';

interface OffScreenIndicatorProps {
  direction: OffScreenDirection;
  variant: PacingCursorVariant;
}

const GRADIENT_CLASS: Record<PacingCursorVariant, Record<OffScreenDirection, string>> = {
  pacer: {
    above: 'bg-gradient-to-b from-amber-500/20 to-transparent',
    below: 'bg-gradient-to-t from-amber-500/20 to-transparent',
  },
  ghost: {
    above: 'bg-gradient-to-b from-gray-500/20 to-transparent',
    below: 'bg-gradient-to-t from-gray-500/20 to-transparent',
  },
};

const ICON_CLASS: Record<PacingCursorVariant, string> = {
  pacer: 'text-amber-400',
  ghost: 'text-gray-400',
};

const POSITION_CLASS: Record<OffScreenDirection, string> = {
  above: 'top-0',
  below: 'bottom-0',
};

const ICON_NAME: Record<OffScreenDirection, 'chevron-up' | 'chevron-down'> = {
  above: 'chevron-up',
  below: 'chevron-down',
};

/** Edge gradient + chevron when a pacing cursor is outside the virtualized viewport. */
export default function OffScreenIndicator({ direction, variant }: OffScreenIndicatorProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute left-0 z-10 flex h-8 w-full items-center justify-center',
        POSITION_CLASS[direction],
        GRADIENT_CLASS[variant][direction],
      ].join(' ')}
    >
      <Icon
        name={ICON_NAME[direction]}
        size={16}
        className={['opacity-80', ICON_CLASS[variant]].join(' ')}
      />
    </div>
  );
}
