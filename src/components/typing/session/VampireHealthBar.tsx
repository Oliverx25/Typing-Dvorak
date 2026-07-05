import { useApp } from '@/contexts/AppProvider';
import Icon from '@/components/ui/icons/Icon';
import { VAMPIRE_MAX_HP, vampireHpPercent } from '@/utils/multiplayer/vampireMode';

interface VampireHealthBarProps {
  hp: number;
  maxHp?: number;
  /** Brief pulse after taking damage. */
  damaged?: boolean;
}

export default function VampireHealthBar({
  hp,
  maxHp = VAMPIRE_MAX_HP,
  damaged = false,
}: VampireHealthBarProps) {
  const { t } = useApp();
  const percent = vampireHpPercent(hp);
  const ratio = maxHp > 0 ? percent / maxHp : 0;

  const fillClass =
    ratio <= 0.2
      ? 'bg-gradient-to-r from-red-700 to-red-500 animate-pulse motion-reduce:animate-none'
      : ratio <= 0.45
        ? 'bg-gradient-to-r from-orange-600 to-amber-500'
        : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-400';

  return (
    <div
      className={[
        'rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 transition-shadow duration-300',
        damaged ? 'shadow-[0_0_18px_rgba(239,68,68,0.35)]' : '',
      ].join(' ')}
      role="meter"
      aria-label={t.multiplayer.vampireHealthLabel}
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={maxHp}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
          <Icon name="vampire" size={14} className="shrink-0" />
          <span>{t.multiplayer.vampireHealthLabel}</span>
        </div>
        <span className="font-mono text-xs tabular-nums text-red-300">
          {Math.round(percent)} / {maxHp}
        </span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className={[
            'h-full rounded-full transition-all duration-300 ease-out',
            fillClass,
            damaged ? 'scale-y-110' : '',
          ].join(' ')}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
