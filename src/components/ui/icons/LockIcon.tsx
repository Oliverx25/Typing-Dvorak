import Icon from '@/components/ui/icons/Icon';

interface LockIconProps {
  size?: number;
  className?: string;
}

export default function LockIcon({ size = 16, className = '' }: LockIconProps) {
  return <Icon name="lock" size={size} className={className} />;
}
