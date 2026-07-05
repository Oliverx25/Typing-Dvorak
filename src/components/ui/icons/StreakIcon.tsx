interface StreakIconProps {
  /** Current day streak — drives color intensity (0 = grey/inactive). */
  streak?: number;
  className?: string;
  size?: number;
}

interface StreakVisual {
  background: string;
  filter?: string;
  opacity?: number;
}

function streakVisual(streak: number): StreakVisual {
  if (streak <= 0) {
    return {
      background: 'linear-gradient(160deg, #475569 0%, #64748b 45%, #94a3b8 100%)',
      opacity: 0.45,
    };
  }

  if (streak <= 2) {
    return {
      background: 'linear-gradient(160deg, var(--color-key-target) 0%, #fdba74 55%, var(--color-highlight) 100%)',
      filter: 'brightness(0.92)',
      opacity: 0.85,
    };
  }

  if (streak <= 6) {
    return {
      background: 'linear-gradient(160deg, var(--color-key-target) 0%, #f97316 45%, var(--color-highlight) 100%)',
      filter: 'brightness(1)',
      opacity: 0.95,
    };
  }

  return {
    background:
      'linear-gradient(160deg, #fef08a 0%, #fb923c 30%, #f97316 55%, var(--color-highlight) 85%, #ef4444 100%)',
    filter: 'brightness(1.12) drop-shadow(0 0 8px color-mix(in srgb, var(--color-highlight) 50%, transparent))',
    opacity: 1,
  };
}

/** Streak flame PNG recolored via CSS mask — intensity scales with active day streak. */
export default function StreakIcon({ streak = 0, className = '', size = 28 }: StreakIconProps) {
  const visual = streakVisual(streak);

  return (
    <span
      role="img"
      aria-hidden="true"
      className={['inline-block shrink-0 transition-all duration-300', className].join(' ')}
      style={{
        width: size,
        height: size,
        background: visual.background,
        opacity: visual.opacity,
        filter: visual.filter,
        WebkitMaskImage: 'url(/streak.png)',
        maskImage: 'url(/streak.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}
