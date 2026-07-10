import Icon from '@/components/ui/icons/Icon';
import { getGradeBadgeClassName } from '@/utils/grading/gradeColors';

interface GradeBadgeProps {
  grade?: string | null;
  className?: string;
}

export default function GradeBadge({ grade, className = '' }: GradeBadgeProps) {
  if (!grade) return null;
  const isSpecial = grade === 'SS+' || grade === 'S+';

  return (
    <span
      className={[
        'inline-flex h-7 w-7 items-center justify-center rounded-md text-sm leading-none',
        getGradeBadgeClassName(grade),
        className,
      ].join(' ')}
    >
      {isSpecial ? (
        <Icon name={grade === 'SS+' ? 'crown' : 'sparkles'} size={13} className="shrink-0" />
      ) : null}
      <span>{grade}</span>
    </span>
  );
}
