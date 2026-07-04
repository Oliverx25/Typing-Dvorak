import { useApp } from '@/contexts/AppProvider';
import SvgIcon from '@/components/ui/SvgIcon';
import {
  WIN_CONDITIONS,
  WIN_CONDITION_ICONS,
  normalizeWinConditions,
  type WinCondition,
} from '@/utils/multiplayer/roomConfig';

interface WinConditionPickerProps {
  value: WinCondition[];
  disabled?: boolean;
  onChange: (value: WinCondition[]) => void;
}

const labelKeys: Record<
  WinCondition,
  'winConditionFirstFinish' | 'winConditionHighestWpm' | 'winConditionSuddenDeath'
> = {
  first_finish: 'winConditionFirstFinish',
  highest_wpm: 'winConditionHighestWpm',
  sudden_death: 'winConditionSuddenDeath',
};

const descKeys: Record<
  WinCondition,
  'winConditionFirstFinishDesc' | 'winConditionHighestWpmDesc' | 'winConditionSuddenDeathDesc'
> = {
  first_finish: 'winConditionFirstFinishDesc',
  highest_wpm: 'winConditionHighestWpmDesc',
  sudden_death: 'winConditionSuddenDeathDesc',
};

export default function WinConditionPicker({
  value,
  disabled = false,
  onChange,
}: WinConditionPickerProps) {
  const { t } = useApp();
  const selected = normalizeWinConditions(value);

  const toggle = (condition: WinCondition) => {
    if (disabled) return;
    const isActive = selected.includes(condition);
    const next = isActive
      ? selected.filter((c) => c !== condition)
      : [...selected, condition];
    onChange(normalizeWinConditions(next));
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[var(--color-text)]">
        {t.multiplayer.winCondition}
      </p>
      <div className="flex gap-3">
        {WIN_CONDITIONS.map((condition) => {
          const isActive = selected.includes(condition);
          const label = t.multiplayer[labelKeys[condition]];
          const description = t.multiplayer[descKeys[condition]];

          return (
            <div key={condition} className="group relative flex-1">
              <button
                type="button"
                disabled={disabled}
                aria-pressed={isActive}
                aria-label={`${label}: ${description}`}
                onClick={(event) => {
                  toggle(condition);
                  event.currentTarget.blur();
                }}
                className={[
                  'flex w-full flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-all duration-300',
                  isActive
                    ? 'scale-[1.02] border-[var(--color-highlight)] bg-[var(--color-highlight)]/10 ring-2 ring-[var(--color-highlight)]/30'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-highlight)]/40',
                  disabled ? 'cursor-not-allowed opacity-50' : '',
                ].join(' ')}
              >
                <SvgIcon
                  src={WIN_CONDITION_ICONS[condition]}
                  size={22}
                  className={
                    isActive
                      ? 'text-[var(--color-highlight)]'
                      : 'text-[var(--color-text-muted)]'
                  }
                />
                <span
                  className={[
                    'text-center text-[10px] font-medium leading-tight',
                    isActive
                      ? 'text-[var(--color-highlight)]'
                      : 'text-[var(--color-text-muted)]',
                  ].join(' ')}
                >
                  {label}
                </span>
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
        })}
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        {t.multiplayer.maxComboTieBreaker}
      </p>
    </div>
  );
}
