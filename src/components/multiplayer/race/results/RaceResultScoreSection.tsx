import { memo } from 'react';
import ModifierIcon from '@/components/multiplayer/setup/ModifierIcon';
import { difficultyTierLabel } from '@/components/multiplayer/setup/SongCard';
import { useApp } from '@/contexts/AppProvider';
import { DIFFICULTY_BADGE_CLASSES } from '@/utils/lyrics/typingDifficulty';
import { formatRaceScore } from '@/utils/multiplayer/raceScoring';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig';
import type { TypingDifficulty } from '@/utils/lyrics/types';

interface RaceResultScoreSectionProps {
  score: number;
  scoreLabel: string;
  difficulty?: TypingDifficulty | null;
  modifiers: RaceModifier[];
}

function RaceResultScoreSection({
  score,
  scoreLabel,
  difficulty,
  modifiers,
}: RaceResultScoreSectionProps) {
  const { t } = useApp();
  const badgeClass = difficulty ? DIFFICULTY_BADGE_CLASSES[difficulty.color] : null;
  const tierLabel = difficulty ? difficultyTierLabel(difficulty.tier, t) : null;

  return (
    <div className="flex flex-col items-center px-6">
      <p className="font-mono text-5xl font-light tabular-nums tracking-tight text-white">
        {formatRaceScore(score)}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">{scoreLabel}</p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {difficulty && badgeClass && tierLabel ? (
          <span
            className={[
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide',
              badgeClass,
            ].join(' ')}
          >
            <span className="font-mono text-[11px] opacity-80">{difficulty.score.toFixed(1)}</span>
            {tierLabel}
          </span>
        ) : null}
        {modifiers.map((modifier) => (
          <ModifierIcon key={modifier} modifier={modifier} isActive readOnly size="sm" />
        ))}
      </div>
    </div>
  );
}

export default memo(RaceResultScoreSection);
