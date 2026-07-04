import { calculateStars } from '@/utils/curriculum/stars';
import Icon from './Icon';

interface StarRatingProps {
  accuracy: number;
  wpm?: number;
  size?: number;
  showLabel?: boolean;
  label?: string;
}

export default function StarRating({
  accuracy,
  wpm,
  size = 22,
  showLabel = true,
  label,
}: StarRatingProps) {
  const stars = calculateStars(accuracy, wpm);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1" aria-label={`${stars} de 3 estrellas`}>
        {[1, 2, 3].map((n) => (
          <Icon
            key={n}
            name={n <= stars ? 'star-filled' : 'star'}
            size={size}
            className={n <= stars ? 'text-[var(--color-key-target)]' : 'text-[var(--color-border)]'}
          />
        ))}
      </div>
      {showLabel && label && (
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      )}
    </div>
  );
}
