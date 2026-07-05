import Icon from '@/components/ui/icons/Icon';

interface GradeBadgeProps {
  grade?: string | null;
  className?: string;
}

function gradeClassName(grade: string): string {
  switch (grade) {
    case 'SS+':
      return 'w-auto gap-1 bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 px-2 font-black text-slate-900 shadow-[0_0_15px_rgba(192,132,252,0.8)] animate-pulse';
    case 'S+':
      return 'w-auto gap-1 bg-gradient-to-br from-yellow-300 to-amber-500 px-2 font-bold text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.6)]';
    case 'SS':
      return 'bg-slate-200 font-black text-slate-900 shadow-[0_0_8px_rgba(226,232,240,0.6)]';
    case 'S':
      return 'bg-yellow-400 font-bold text-yellow-950';
    case 'A':
      return 'bg-emerald-500 font-bold text-white';
    case 'B':
      return 'bg-blue-500 font-bold text-white';
    case 'C':
      return 'bg-purple-500 font-semibold text-white';
    case 'D':
    case 'F':
      return 'bg-slate-700 font-semibold text-slate-400';
    default:
      return 'bg-slate-700 font-semibold text-slate-400';
  }
}

export default function GradeBadge({ grade, className = '' }: GradeBadgeProps) {
  if (!grade) return null;
  const isSpecial = grade === 'SS+' || grade === 'S+';

  return (
    <span
      className={[
        'inline-flex h-7 w-7 items-center justify-center rounded-md text-sm leading-none',
        gradeClassName(grade),
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
