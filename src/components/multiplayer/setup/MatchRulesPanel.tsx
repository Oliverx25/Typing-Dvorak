import { useApp } from '@/contexts/AppProvider';
import ModBadge from '@/components/multiplayer/setup/ModBadge';
import {
  ALL_MODIFIERS,
  MODIFIER_ICONS,
  SONG_ONLY_MODIFIERS,
  VICTORY_CONDITIONS,
  VICTORY_CONDITION_ICONS,
  availableModifiers,
  normalizeModifiers,
  normalizeWinCondition,
  type RaceModifier,
  type VictoryCondition,
} from '@/utils/multiplayer/roomConfig';
import type { TextSource } from '@/utils/multiplayer/roomStorage';

interface MatchRulesPanelProps {
  winCondition: VictoryCondition;
  modifiers: RaceModifier[];
  textSource?: TextSource;
  disabled?: boolean;
  onChange: (partial: {
    winCondition?: VictoryCondition;
    modifiers?: RaceModifier[];
  }) => void;
}

const winLabelKeys: Record<
  VictoryCondition,
  'winConditionFirstFinish' | 'winConditionHighestWpm' | 'winConditionMaxScore'
> = {
  first_finish: 'winConditionFirstFinish',
  highest_wpm: 'winConditionHighestWpm',
  max_score: 'winConditionMaxScore',
};

const winDescKeys: Record<
  VictoryCondition,
  'winConditionFirstFinishDesc' | 'winConditionHighestWpmDesc' | 'winConditionMaxScoreDesc'
> = {
  first_finish: 'winConditionFirstFinishDesc',
  highest_wpm: 'winConditionHighestWpmDesc',
  max_score: 'winConditionMaxScoreDesc',
};

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

export default function MatchRulesPanel({
  winCondition,
  modifiers,
  textSource = 'lesson',
  disabled = false,
  onChange,
}: MatchRulesPanelProps) {
  const { t } = useApp();
  const selectedCondition = normalizeWinCondition(winCondition);
  const selectedModifiers = normalizeModifiers(modifiers);
  const modifierOptions = availableModifiers(textSource);

  const selectWinCondition = (condition: VictoryCondition) => {
    if (disabled) return;
    onChange({ winCondition: condition });
  };

  const toggleModifier = (modifier: RaceModifier) => {
    if (disabled) return;
    const isActive = selectedModifiers.includes(modifier);
    const next = isActive
      ? selectedModifiers.filter((m) => m !== modifier)
      : [...selectedModifiers, modifier];
    onChange({ modifiers: normalizeModifiers(next) });
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
              tone="victory"
              icon={VICTORY_CONDITION_ICONS[condition]}
              title={t.multiplayer[winLabelKeys[condition]]}
              description={t.multiplayer[winDescKeys[condition]]}
              isActive={selectedCondition === condition}
              disabled={disabled}
              onClick={() => selectWinCondition(condition)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.multiplayer.modifiers}
        </p>
        <div className="flex flex-col gap-2">
          {ALL_MODIFIERS.filter((mod) => modifierOptions.includes(mod)).map((modifier) => (
            <ModBadge
              key={modifier}
              tone={modifier}
              icon={MODIFIER_ICONS[modifier]}
              title={t.multiplayer[modifierLabelKeys[modifier]]}
              description={t.multiplayer[modifierDescKeys[modifier]]}
              isActive={selectedModifiers.includes(modifier)}
              disabled={disabled}
              onClick={() => toggleModifier(modifier)}
            />
          ))}
        </div>
        {textSource !== 'song' && SONG_ONLY_MODIFIERS.length > 0 ? (
          <p className="mt-2 text-[10px] text-slate-500">
            {t.multiplayer.songOnlyModifiersHint}
          </p>
        ) : null}
      </section>
    </div>
  );
}
