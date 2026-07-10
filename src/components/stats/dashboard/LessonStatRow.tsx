import { GradeBadge } from '@/components/ui';
import { calculateGrade } from '@/utils/grading';
import { getGradeColorClasses, getGradeMicroBarClassName } from '@/utils/grading/gradeColors';

export interface LessonStatRowData {
  id: string;
  title: string;
  wpm: number;
  accuracy: number;
  grade: string | null;
}

interface LessonStatRowProps {
  lesson: LessonStatRowData;
  rowIndex: number;
  maxWpm: number;
  practiceLabel: string;
}

const BADGE_SLOT_WIDTH = 'w-14';

export default function LessonStatRow({
  lesson,
  rowIndex,
  maxWpm,
  practiceLabel,
}: LessonStatRowProps) {
  const displayGrade = lesson.grade ?? calculateGrade(lesson.accuracy);
  const colors = getGradeColorClasses(displayGrade);
  const microBarWidth = maxWpm > 0 ? Math.min(100, (lesson.wpm / maxWpm) * 100) : 0;

  return (
    <div
      className={[
        'group grid grid-cols-[1fr_auto_auto_80px] items-center gap-6 border-b border-slate-200 p-3 transition-colors last:border-b-0 dark:border-slate-700/50',
        rowIndex % 2 === 1 ? 'bg-slate-50/80 dark:bg-slate-800/20' : 'bg-transparent',
        'hover:bg-slate-100 dark:hover:bg-slate-800/40',
      ].join(' ')}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex ${BADGE_SLOT_WIDTH} shrink-0 items-center justify-start`}>
          <GradeBadge grade={displayGrade} className="h-7 w-7 text-xs" />
        </div>

        <span className="min-w-0 truncate text-sm text-slate-900 dark:text-slate-100">
          {lesson.title}
        </span>
      </div>

      <div className="flex flex-col items-end justify-center text-sm">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">ACC</span>
        <span className="text-slate-900 dark:text-slate-100">{lesson.accuracy}%</span>
      </div>

      <div className="flex w-20 flex-col items-end justify-center">
        <span className={['font-mono text-lg font-bold', colors.text].join(' ')}>
          {lesson.wpm}
        </span>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={['h-full rounded-full transition-all duration-500', getGradeMicroBarClassName(displayGrade)].join(
              ' ',
            )}
            style={{ width: `${microBarWidth}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <a
        href={`/lesson/${lesson.id}`}
        className="inline-flex items-center justify-center rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 group-hover:border-slate-400 group-hover:text-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-400 dark:hover:bg-slate-700 dark:hover:text-white dark:group-hover:text-slate-200"
        aria-label={`${practiceLabel}: ${lesson.title}`}
      >
        {practiceLabel}
      </a>
    </div>
  );
}
