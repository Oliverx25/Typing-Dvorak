import { useApp } from '@/contexts/AppProvider';
import ModBadge from '@/components/multiplayer/setup/ModBadge';
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
  | 'winConditionFirstFinish'
  | 'winConditionHighestWpm'
  | 'winConditionMaxScore'
  | 'winConditionSuddenDeath'
> = {
  first_finish: 'winConditionFirstFinish',
  highest_wpm: 'winConditionHighestWpm',
  max_score: 'winConditionMaxScore',
  sudden_death: 'winConditionSuddenDeath',
};

const winDescKeys: Record<
  WinCondition,
  | 'winConditionFirstFinishDesc'
  | 'winConditionHighestWpmDesc'
  | 'winConditionMaxScoreDesc'
  | 'winConditionSuddenDeathDesc'
> = {
  first_finish: 'winConditionFirstFinishDesc',
  highest_wpm: 'winConditionHighestWpmDesc',
  max_score: 'winConditionMaxScoreDesc',
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
    <div className="flex h-full min-h-0 flex-col gap-5">
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.multiplayer.winCondition}
        </p>
        <div className="flex flex-col gap-2">
          {VICTORY_CONDITIONS.map((condition) => (
            <ModBadge
              key={condition}
              icon={WIN_CONDITION_ICONS[condition]}
              title={t.multiplayer[winLabelKeys[condition]]}
              description={t.multiplayer[winDescKeys[condition]]}
              isActive={selected.includes(condition)}
              disabled={disabled}
              onClick={() => toggleWinCondition(condition)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.multiplayer.modifiers}
        </p>
        <div className="flex flex-col gap-2">
          {MODIFIER_WIN_CONDITIONS.map((condition) => (
            <ModBadge
              key={condition}
              icon={WIN_CONDITION_ICONS[condition]}
              title={t.multiplayer[winLabelKeys[condition]]}
              description={t.multiplayer[winDescKeys[condition]]}
              isActive={selected.includes(condition)}
              disabled={disabled}
              onClick={() => toggleWinCondition(condition)}
            />
          ))}
          <ModBadge
            icon={BLIND_MODE_ICON}
            title={t.multiplayer.blindModeMod}
            description={t.multiplayer.blindModeModDesc}
            isActive={blindMode}
            disabled={disabled}
            onClick={() => onChange({ blindMode: !blindMode })}
          />
        </div>
      </section>
    </div>
  );
}
