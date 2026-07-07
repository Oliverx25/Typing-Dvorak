import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { useFocusedChapter } from '@/contexts/FocusedChapterProvider';
import { CORE_LESSONS } from '@/utils/curriculum/lessons';
import { useLessonCardState } from '@/hooks/useLessonCardState';
import { LockIcon, BestScoreLabel } from '@/components/ui';
import LessonMasteryPanel from '@/components/lessons/LessonMasteryPanel';
import { MASTERY_RING_CLASSES } from '@/utils/curriculum/mastery';

interface LibraryCardProps {
  lessonId: string;
  title: string;
  difficultyLabel: string;
  locked: boolean;
  focused: boolean;
  isRecommended: boolean;
  highestGrade: string | null;
  highestScore: number | null;
  scoreUnit: string;
  inProgressLabel: string;
  tapToReviewLabel: string;
  onSelect: () => void;
}

function LibraryCard({
  lessonId,
  title,
  difficultyLabel,
  locked,
  focused,
  isRecommended,
  highestGrade,
  highestScore,
  scoreUnit,
  inProgressLabel,
  tapToReviewLabel,
  onSelect,
}: LibraryCardProps) {
  if (locked) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-surface-elevated)]/40 px-4 py-3 opacity-50">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">{difficultyLabel}</p>
        </div>
        <LockIcon size={14} className="shrink-0 text-[var(--color-text-muted)]" />
      </div>
    );
  }

  const baseClass =
    'w-full rounded-xl px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)]';

  if (focused) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`${baseClass} border border-[var(--color-highlight)]/30 bg-[var(--color-highlight)]/8 py-4 ring-1 ring-[var(--color-highlight)]/15`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-highlight)]">
          {difficultyLabel}
        </p>
        <p className="mt-1 text-base font-semibold text-[var(--color-text)]">{title}</p>
        <BestScoreLabel
          highestGrade={highestGrade}
          highestScore={highestScore}
          scoreUnit={scoreUnit}
          className="mt-2"
        />
        <LessonMasteryPanel lessonId={lessonId} size="sm" className="mt-2" />
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {isRecommended ? inProgressLabel : tapToReviewLabel}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${baseClass} flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-highlight)]/40 hover:bg-[var(--color-surface)]`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">{difficultyLabel}</p>
        <LessonMasteryPanel lessonId={lessonId} size="sm" className="mt-1.5" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <BestScoreLabel
          highestGrade={highestGrade}
          highestScore={highestScore}
          scoreUnit={scoreUnit}
        />
        <span className="text-xs text-[var(--color-highlight)]">→</span>
      </div>
    </button>
  );
}

function LibraryCardRow({ lessonId }: { lessonId: string }) {
  const { t } = useApp();
  const { focusedLessonId, recommendedId, setFocusedLessonId } = useFocusedChapter();
  const { unlocked, highestGrade, highestScore, masteryTier } = useLessonCardState(lessonId);
  const lesson = CORE_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return null;

  const title = getLessonTitle(t, lesson.titleKey);
  const difficultyLabel = t.difficulty[lesson.difficulty];
  const ringClass = MASTERY_RING_CLASSES[masteryTier];

  return (
    <div className={ringClass ? `rounded-xl ${ringClass}` : undefined}>
      <LibraryCard
        lessonId={lessonId}
      title={title}
      difficultyLabel={difficultyLabel}
      locked={!unlocked}
      focused={lessonId === focusedLessonId}
      isRecommended={lessonId === recommendedId}
      highestGrade={highestGrade}
      highestScore={highestScore}
      scoreUnit={t.multiplayer.raceScore}
      inProgressLabel={t.home.inProgress}
      tapToReviewLabel={t.home.tapToReview}
      onSelect={() => setFocusedLessonId(lessonId)}
      />
    </div>
  );
}

export default function LessonLibraryGrid() {
  const { t } = useApp();

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        {t.home.lessonLibrary}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CORE_LESSONS.map((lesson) => (
          <LibraryCardRow key={lesson.id} lessonId={lesson.id} />
        ))}
      </div>
    </section>
  );
}
