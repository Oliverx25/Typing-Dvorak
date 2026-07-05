import Icon from './Icon';

interface StreakIconProps {
  className?: string;
  size?: number;
}

export default function StreakIcon({ className = '', size = 28 }: StreakIconProps) {
  return (
    <Icon
      name="flame"
      size={size}
      className={['text-[var(--color-highlight)]', className].join(' ')}
      aria-hidden="true"
    />
  );
}
