import AppShell from '@/components/layout/shell/AppShell';
import { getLessonById } from '@/utils/curriculum/lessons';
import TypingTest from '@/components/typing/session/TypingTest';
import LessonGuard from '@/components/lessons/library/LessonGuard';
import BackLink from '@/components/layout/shell/BackLink';
import { BestScoreLabel } from '@/components/ui';
import { useLessonCardState } from '@/hooks/useLessonCardState';
import { useApp, getLessonDescription, getLessonTitle } from '@/contexts/AppProvider';

interface LessonPageProps {
  lessonId: string;
}

function LessonContent({ lessonId }: { lessonId: string }) {
  const { t } = useApp();
  const { highestGrade, highestScore } = useLessonCardState(lessonId);
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <>
        <BackLink />
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-10 text-center">
          <h1 className="text-xl font-bold text-[var(--color-text)]">{t.lesson.notFoundTitle}</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">{t.lesson.notFoundDesc}</p>
          <a
            href="/lessons"
            className="mt-6 inline-block rounded-lg bg-[var(--color-highlight)] px-6 py-2.5 font-medium text-white no-underline hover:bg-[var(--color-highlight-hover)]"
          >
            {t.lesson.goBack}
          </a>
        </div>
      </>
    );
  }

  const title = getLessonTitle(t, lesson.titleKey);
  const description = getLessonDescription(t, lesson.descriptionKey);
  const categoryLabel = t.categories[lesson.category] ?? lesson.category;
  const difficultyLabel = t.difficulty[lesson.difficulty];

  return (
    <>
      <BackLink />

      <header className="mb-10 border-b border-[var(--color-border)] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-highlight)]/10 px-3 py-1 text-xs font-medium text-[var(--color-highlight)]">
            {categoryLabel}
          </span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
            {difficultyLabel}
          </span>
          <BestScoreLabel
            highestGrade={highestGrade}
            highestScore={highestScore}
            scoreUnit={t.multiplayer.raceScore}
            size="md"
          />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-lg text-[var(--color-text-muted)]">{description}</p>
      </header>

      <LessonGuard lessonId={lessonId}>
        <TypingTest lessonId={lessonId} lesson={lesson} />
      </LessonGuard>
    </>
  );
}

export default function LessonPage({ lessonId }: LessonPageProps) {
  return (
    <AppShell>
      <LessonContent lessonId={lessonId} />
    </AppShell>
  );
}
