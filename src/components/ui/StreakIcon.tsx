interface StreakIconProps {
  className?: string;
  size?: number;
}

/** Recolors the black streak PNG via CSS mask to match app accent tones. */
export default function StreakIcon({ className = '', size = 28 }: StreakIconProps) {
  return (
    <span
      role="img"
      aria-hidden="true"
      className={['inline-block shrink-0', className].join(' ')}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(160deg, var(--color-key-target) 0%, #f97316 45%, var(--color-highlight) 100%)',
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
