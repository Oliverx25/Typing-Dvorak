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

const BADGE_SLOT_WIDTH = 'w-14';
const PRACTICE_SLOT_WIDTH = 'w-[5.5rem]';

export default function LessonStatRow({
  lesson,
  maxWpm,
  practiceLabel,
  accuracyLabel,
}: LessonStatRowProps) {
  const barWidth = Math.max(4, Math.min(100, (lesson.wpm / maxWpm) * 100));
  const displayGrade = lesson.grade ?? calculateGrade(lesson.accuracy);

  return (
    <div className="relative overflow-hidden border-b border-[var(--color-border)] transition-colors last:border-0 hover:bg-[var(--color-highlight)]/5">
      <div
        className="absolute top-0 bottom-0 left-0 z-0 bg-[var(--color-highlight)]/10 transition-all duration-500"
        style={{ width: `${barWidth}%` }}
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

        <span className="w-12 shrink-0 text-right font-mono text-sm font-bold text-[var(--color-highlight)]">
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
