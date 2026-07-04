import { useApp } from '@/contexts/AppProvider';
import RuleBadgeButton from '@/components/multiplayer/RuleBadgeButton';
import {
  BLIND_MODE_ICON,
  MODIFIER_WIN_CONDITIONS,
  VICTORY_CONDITIONS,
  WIN_CONDITION_ICONS,
  normalizeWinConditions,
  type WinCondition,
} from '@/utils/multiplayer/roomConfig';

interface MatchRulesPanelProps {
  winConditions: WinCondition[];
  blindMode: boolean;
  disabled?: boolean;
  onChange: (partial: { winConditions?: WinCondition[]; blindMode?: boolean }) => void;
}

const winLabelKeys: Record<
  WinCondition,
  'winConditionFirstFinish' | 'winConditionHighestWpm' | 'winConditionSuddenDeath'
> = {
  first_finish: 'winConditionFirstFinish',
  highest_wpm: 'winConditionHighestWpm',
  sudden_death: 'winConditionSuddenDeath',
};

const winDescKeys: Record<
  WinCondition,
  'winConditionFirstFinishDesc' | 'winConditionHighestWpmDesc' | 'winConditionSuddenDeathDesc'
> = {
  first_finish: 'winConditionFirstFinishDesc',
  highest_wpm: 'winConditionHighestWpmDesc',
  sudden_death: 'winConditionSuddenDeathDesc',
};

export default function MatchRulesPanel({
  winConditions,
  blindMode,
  disabled = false,
  onChange,
}: MatchRulesPanelProps) {
  const { t } = useApp();
  const selected = normalizeWinConditions(winConditions);

  const toggleWinCondition = (condition: WinCondition) => {
    if (disabled) return;
    const isActive = selected.includes(condition);
    const without = selected.filter((c) => c !== condition);
    const next = isActive ? without : [...selected, condition];
    onChange({ winConditions: normalizeWinConditions(next) });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.multiplayer.winCondition}
        </p>
        <div className="flex flex-row flex-wrap gap-2">
          {VICTORY_CONDITIONS.map((condition) => (
            <RuleBadgeButton
              key={condition}
              icon={WIN_CONDITION_ICONS[condition]}
              label={t.multiplayer[winLabelKeys[condition]]}
              description={t.multiplayer[winDescKeys[condition]]}
              isActive={selected.includes(condition)}
              disabled={disabled}
              onClick={() => toggleWinCondition(condition)}
            />
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.multiplayer.modifiers}
        </p>
        <div className="flex flex-row flex-wrap gap-2">
          {MODIFIER_WIN_CONDITIONS.map((condition) => (
            <RuleBadgeButton
              key={condition}
              icon={WIN_CONDITION_ICONS[condition]}
              label={t.multiplayer[winLabelKeys[condition]]}
              description={t.multiplayer[winDescKeys[condition]]}
              isActive={selected.includes(condition)}
              disabled={disabled}
              onClick={() => toggleWinCondition(condition)}
            />
          ))}
          <RuleBadgeButton
            icon={BLIND_MODE_ICON}
            label={t.multiplayer.blindModeMod}
            description={t.multiplayer.blindModeModDesc}
            isActive={blindMode}
            disabled={disabled}
            onClick={() => onChange({ blindMode: !blindMode })}
          />
        </div>
      </section>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-[var(--color-text-muted)]">
        {t.multiplayer.maxComboTieBreaker}
      </p>
    </div>
  );
}
