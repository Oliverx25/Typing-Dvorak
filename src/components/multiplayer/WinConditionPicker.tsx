import { useApp } from '@/contexts/AppProvider';
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

  const activeDescriptions = WIN_CONDITIONS.filter((c) => selected.includes(c)).map(
    (c) => t.multiplayer[descKeys[c]],
  );

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">
        {t.multiplayer.winCondition}
      </p>
      <div className="flex gap-4">
        {WIN_CONDITIONS.map((condition) => {
          const isActive = selected.includes(condition);
          const label = t.multiplayer[labelKeys[condition]];
          return (
            <button
              key={condition}
              type="button"
              disabled={disabled}
              aria-pressed={isActive}
              aria-label={label}
              title={`${label} — ${t.multiplayer[descKeys[condition]]}`}
              onClick={() => toggle(condition)}
              className={[
                'flex flex-1 flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition-all duration-300',
                isActive
                  ? 'scale-105 border-[var(--color-highlight)] bg-[var(--color-highlight)]/10 text-[var(--color-highlight)] ring-2 ring-[var(--color-highlight)]/30'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:border-[var(--color-highlight)]/50 hover:text-[var(--color-text)]',
                disabled ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
            >
              <img
                src={WIN_CONDITION_ICONS[condition]}
                alt=""
                aria-hidden="true"
                className="h-6 w-6"
                style={{
                  filter: isActive ? undefined : 'grayscale(1)',
                  opacity: isActive ? 1 : 0.75,
                }}
              />
              <span className="text-[11px] font-medium leading-tight">{label}</span>
            </button>
          );
        })}
      </div>

      {activeDescriptions.length > 0 ? (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {activeDescriptions.join(' · ')}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        {t.multiplayer.maxComboTieBreaker}
      </p>
    </div>
  );
}
