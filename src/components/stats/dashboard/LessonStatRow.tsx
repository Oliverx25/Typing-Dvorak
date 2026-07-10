import { GradeBadge } from '@/components/ui';
import { calculateGrade } from '@/utils/grading';

export interface LessonStatRowData {
  id: string;
  title: string;
  wpm: number;
  accuracy: number;
  grade: string | null;
}

interface LessonStatRowProps {
  lesson: LessonStatRowData;
  maxWpm: number;
  practiceLabel: string;
  accuracyLabel: string;
}

export default function LessonStatRow({
  lesson,
  maxWpm,
  practiceLabel,
  accuracyLabel,
}: LessonStatRowProps) {
  const barWidth = Math.max(4, Math.min(100, (lesson.wpm / maxWpm) * 100));
  const displayGrade = lesson.grade ?? calculateGrade(lesson.accuracy);

  return (
    <div className="group relative flex items-center justify-between overflow-hidden border-b border-slate-200 p-3 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30">
      <div
        className="absolute top-0 bottom-0 left-0 z-0 bg-indigo-50 transition-all duration-500 dark:bg-indigo-900/20"
        style={{ width: `${barWidth}%` }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3 pr-24">
        <GradeBadge grade={displayGrade} className="h-7 w-7 shrink-0 text-xs" />
        <span className="truncate text-sm text-[var(--color-text)]">{lesson.title}</span>
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-4">
        <span className="hidden text-xs text-slate-500 sm:inline">
          {accuracyLabel}: {lesson.accuracy}%
        </span>
        <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
          {lesson.wpm}
        </span>
      </div>

      <a
        href={`/lesson/${lesson.id}`}
        className="absolute right-4 z-20 rounded border border-slate-200 bg-white p-1.5 text-xs font-medium text-slate-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        aria-label={`${practiceLabel}: ${lesson.title}`}
      >
        {practiceLabel}
      </a>
    </div>
  );
}
