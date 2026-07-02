import { AppProvider, getLessonDescription, getLessonTitle } from '../contexts/AppProvider';
import { getLessonById } from '../utils/lessons';
import TypingTest from './TypingTest';
import LessonGuard from './LessonGuard';
import PageLayout from './PageLayout';
import { useApp } from '../contexts/AppProvider';

interface LessonPageProps {
  lessonId: string;
}

function LessonContent({ lessonId }: { lessonId: string }) {
  const { t } = useApp();
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;

  const title = getLessonTitle(t, lesson.titleKey);
  const description = getLessonDescription(t, lesson.descriptionKey);
  const categoryLabel = t.categories[lesson.category] ?? lesson.category;
  const difficultyLabel = t.difficulty[lesson.difficulty];

  return (
    <>
      <nav className="mb-8">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-accent)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          {t.nav.backToLessons}
        </a>
      </nav>

      <header className="mb-10 border-b border-[var(--color-border)] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--color-accent)]">{categoryLabel}</span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)]">{difficultyLabel}</span>
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
    <AppProvider>
      <PageLayout>
        <LessonContent lessonId={lessonId} />
      </PageLayout>
    </AppProvider>
  );
}
