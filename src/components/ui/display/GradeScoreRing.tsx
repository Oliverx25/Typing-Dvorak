import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icons/Icon';
import {
  type Grade,
  gradeAtScoreProgress,
  gradeRingClass,
} from '@/utils/grading';
import { formatRaceScore } from '@/utils/multiplayer/raceScoring';

interface GradeScoreRingProps {
  score: number;
  maxScore: number;
  finalGrade: Grade;
  totalMultiplier?: number;
  scoreLabel?: string;
  animateKey?: string | number;
  size?: 'md' | 'lg';
}

function useAnimatedProgress(target: number, animateKey: string | number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1600;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, animateKey]);

  return value;
}

export default function GradeScoreRing({
  score,
  maxScore,
  finalGrade,
  totalMultiplier = 1,
  scoreLabel,
  animateKey = 'default',
  size = 'lg',
}: GradeScoreRingProps) {
  const safeMax = Math.max(maxScore, score, 1);
  const animatedScore = useAnimatedProgress(score, animateKey);
  const scoreProgress = Math.min(1, animatedScore / safeMax);
  const displayGrade = gradeAtScoreProgress(scoreProgress, finalGrade, totalMultiplier);
  const ringClass = gradeRingClass(displayGrade);
  const isSpecial = displayGrade === 'SS+' || displayGrade === 'S+';

  const outer = size === 'lg' ? 'h-36 w-36' : 'h-28 w-28';
  const gradeText = size === 'lg' ? 'text-5xl' : 'text-4xl';
  const scoreText = size === 'lg' ? 'text-4xl' : 'text-3xl';
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - scoreProgress);

  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          'relative flex items-center justify-center rounded-full bg-gradient-to-br p-[3px] shadow-lg shadow-black/20',
          outer,
          ringClass,
        ].join(' ')}
      >
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2.5"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[var(--color-surface)]">
          <div className="flex flex-col items-center gap-0.5">
            {isSpecial ? (
              <Icon
                name={displayGrade === 'SS+' ? 'crown' : 'sparkles'}
                size={size === 'lg' ? 16 : 14}
                className="shrink-0 text-[var(--color-text)]"
              />
            ) : null}
            <span
              className={[
                'font-black tracking-tight text-transparent bg-gradient-to-br bg-clip-text',
                gradeText,
                ringClass,
              ].join(' ')}
            >
              {displayGrade}
            </span>
          </div>
        </div>
      </div>

      <p className={`mt-6 font-mono font-bold tabular-nums tracking-tight text-[var(--color-text)] ${scoreText}`}>
        {formatRaceScore(Math.round(animatedScore))}
      </p>
      {scoreLabel ? (
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {scoreLabel}
        </p>
      ) : null}
    </div>
  );
}
