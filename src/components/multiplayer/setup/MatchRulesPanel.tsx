import { useApp } from '@/contexts/AppProvider';
import ModBadge from '@/components/multiplayer/setup/ModBadge';
import ModifierIcon from '@/components/multiplayer/setup/ModifierIcon';
import {
  GENERAL_MODIFIERS,
  SONG_ONLY_MODIFIERS,
  VICTORY_CONDITIONS,
  VICTORY_CONDITION_ICONS,
  normalizeModifiers,
  normalizeWinCondition,
  toggleRaceModifier,
  totalModifierMultiplier,
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

interface ModifierGridProps {
  mods: RaceModifier[];
  selectedModifiers: RaceModifier[];
  disabled: boolean;
  onToggle: (modifier: RaceModifier) => void;
}

function ModifierGrid({ mods, selectedModifiers, disabled, onToggle }: ModifierGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 overflow-visible">
      {mods.map((modifier) => (
        <ModifierIcon
          key={modifier}
          modifier={modifier}
          isActive={selectedModifiers.includes(modifier)}
          disabled={disabled}
          onClick={() => onToggle(modifier)}
        />
      ))}
    </div>
  );
}

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
  const isSongMode = textSource === 'song';
  const totalMultiplier = totalModifierMultiplier(selectedModifiers);

  const selectWinCondition = (condition: VictoryCondition) => {
    if (disabled) return;
    onChange({ winCondition: condition });
  };

  const toggleModifier = (modifier: RaceModifier) => {
    if (disabled) return;
    onChange({ modifiers: normalizeModifiers(toggleRaceModifier(selectedModifiers, modifier)) });
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

      <section className="overflow-visible">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.multiplayer.modifiers}
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wider text-slate-500">
              {t.multiplayer.modifierGeneralSection}
            </p>
            <ModifierGrid
              mods={GENERAL_MODIFIERS}
              selectedModifiers={selectedModifiers}
              disabled={disabled}
              onToggle={toggleModifier}
            />
          </div>

          {isSongMode ? (
            <div className="mt-1 flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-wider text-slate-500">
                {t.multiplayer.modifierSongSection}
              </p>
              <ModifierGrid
                mods={SONG_ONLY_MODIFIERS}
                selectedModifiers={selectedModifiers}
                disabled={disabled}
                onToggle={toggleModifier}
              />
            </div>
          ) : (
            <p className="text-[10px] text-slate-500">
              {t.multiplayer.songOnlyModifiersHint}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {t.multiplayer.totalMultiplier}
            </span>
            <span className="rounded bg-emerald-400/10 px-2 py-0.5 font-mono text-xs text-emerald-400">
              x{totalMultiplier.toFixed(2)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
