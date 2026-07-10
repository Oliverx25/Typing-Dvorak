import { GradeBadge } from '@/components/ui';
import { calculateGrade } from '@/utils/grading';
import {
  getGradeColorClasses,
  getWpmBarWidthStyle,
  WPM_BAR_MUTED_BG,
} from '@/utils/grading/gradeColors';

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

const BADGE_SLOT_WIDTH = 'w-14';
const PRACTICE_SLOT_WIDTH = 'w-[5.5rem]';

export default function LessonStatRow({
  lesson,
  maxWpm,
  practiceLabel,
  accuracyLabel,
}: LessonStatRowProps) {
  const displayGrade = lesson.grade ?? calculateGrade(lesson.accuracy);
  const colors = getGradeColorClasses(displayGrade);

  return (
    <div className="relative overflow-hidden border-b border-[var(--color-border)] transition-colors last:border-0 hover:bg-[var(--color-highlight)]/5">
      <div
        className={[
          'absolute top-0 bottom-0 left-0 z-0 border-r-2 transition-all duration-500',
          WPM_BAR_MUTED_BG,
          colors.border,
        ].join(' ')}
        style={{ width: getWpmBarWidthStyle(lesson.wpm, maxWpm) }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center gap-3 px-4 py-3">
        <div className={`flex ${BADGE_SLOT_WIDTH} shrink-0 items-center justify-center`}>
          <GradeBadge grade={displayGrade} className="h-7 w-7 text-xs" />
        </div>

        <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text)]">
          {lesson.title}
        </span>

        <span className="hidden w-28 shrink-0 text-right text-xs text-[var(--color-text-muted)] sm:inline">
          {accuracyLabel}: {lesson.accuracy}%
        </span>

        <span className={['w-12 shrink-0 text-right font-mono text-sm font-bold', colors.text].join(' ')}>
          {lesson.wpm}
        </span>

        <div className={`flex ${PRACTICE_SLOT_WIDTH} shrink-0 justify-end`}>
          <a
            href={`/lesson/${lesson.id}`}
            className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-highlight)]/40 hover:text-[var(--color-highlight)]"
            aria-label={`${practiceLabel}: ${lesson.title}`}
          >
            {practiceLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
