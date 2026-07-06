import { GradeBadge } from '@/components/ui';
import { formatRaceScore } from '@/utils/multiplayer/raceScoring';

interface BestScoreLabelProps {
  highestGrade?: string | null;
  highestScore?: number | null;
  scoreUnit?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function BestScoreLabel({
  highestGrade,
  highestScore,
  scoreUnit = 'pts',
  size = 'sm',
  className = '',
}: BestScoreLabelProps) {
  if (!highestGrade && (highestScore == null || highestScore <= 0)) return null;

  const scoreText =
    highestScore != null && highestScore > 0
      ? `${formatRaceScore(highestScore)} ${scoreUnit}`
      : null;

  return (
    <div className={['flex items-center gap-1.5', className].join(' ')}>
      <GradeBadge
        grade={highestGrade}
        className={size === 'sm' ? 'h-6 min-w-6 text-xs' : 'h-7 min-w-7 text-sm'}
      />
      {scoreText ? (
        <span
          className={[
            'font-mono font-semibold tabular-nums text-[var(--color-text)]',
            size === 'sm' ? 'text-xs' : 'text-sm',
          ].join(' ')}
        >
          {scoreText}
        </span>
      ) : null}
    </div>
  );
}
