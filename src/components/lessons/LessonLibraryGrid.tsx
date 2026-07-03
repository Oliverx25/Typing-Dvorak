import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { CORE_LESSONS } from '@/utils/lessons';
import { useLessonCardState } from '@/hooks/useLessonCardState';
import { useCurriculumState } from '@/hooks/useCurriculumState';
import { LockIcon } from '@/components/ui';

interface LibraryCardProps {
  lessonId: string;
  title: string;
  difficultyLabel: string;
  locked: boolean;
  active: boolean;
  inProgressLabel: string;
}

function LibraryCard({ lessonId, title, difficultyLabel, locked, active, inProgressLabel }: LibraryCardProps) {
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

  if (active) {
    return (
      <a
        href={`/lesson/${lessonId}`}
        className="block rounded-xl border border-[var(--color-correct)]/30 bg-[var(--color-correct)]/5 px-4 py-4 no-underline ring-1 ring-[var(--color-correct)]/20 transition hover:bg-[var(--color-correct)]/10"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-correct)]">{difficultyLabel}</p>
        <p className="mt-1 text-base font-semibold text-[var(--color-text)]">{title}</p>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{inProgressLabel}</p>
      </a>
    );
  }

  return (
    <a
      href={`/lesson/${lessonId}`}
      className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 no-underline transition hover:border-[var(--color-correct)]/40 hover:bg-[var(--color-surface)]"
    >
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">{difficultyLabel}</p>
      </div>
      <span className="text-xs text-[var(--color-correct)]">→</span>
    </a>
  );
}

function LibraryCardRow({ lessonId, active }: { lessonId: string; active: boolean }) {
  const { t } = useApp();
  const { unlocked } = useLessonCardState(lessonId);
  const lesson = CORE_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return null;

  const title = getLessonTitle(t, lesson.titleKey);
  const difficultyLabel = t.difficulty[lesson.difficulty];

  return (
    <LibraryCard
      lessonId={lessonId}
      title={title}
      difficultyLabel={difficultyLabel}
      locked={!unlocked}
      active={active}
      inProgressLabel={t.home.inProgress}
    />
  );
}

export default function LessonLibraryGrid() {
  const { t } = useApp();
  const { recommendedId } = useCurriculumState();

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        {t.home.lessonLibrary}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CORE_LESSONS.map((lesson) => (
          <LibraryCardRow key={lesson.id} lessonId={lesson.id} active={lesson.id === recommendedId} />
        ))}
      </div>
    </section>
  );
}
