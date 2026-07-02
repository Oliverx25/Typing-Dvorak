import { useEffect, useState } from 'react';
import { useApp, getLessonDescription, getLessonTitle } from '../contexts/AppProvider';
import { isLessonUnlocked, getRecommendedLessonId, getCurriculumProgress } from '../utils/curriculum';
import { getBestWpmForLesson, getCompletedLessonsMap } from '../utils/storage';
import type { Lesson } from '../utils/lessons';
import { LESSONS } from '../utils/lessons';

interface LessonCardProps {
  lesson: Lesson;
  recommended?: boolean;
}

export default function LessonCard({ lesson, recommended = false }: LessonCardProps) {
  const { t } = useApp();
  const [unlocked, setUnlocked] = useState(true);
  const [bestWpm, setBestWpm] = useState<number | null>(null);

  useEffect(() => {
    const completed = getCompletedLessonsMap();
    const completedForUnlock = Object.fromEntries(
      Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
    );
    setUnlocked(isLessonUnlocked(lesson.id, completedForUnlock));
    setBestWpm(getBestWpmForLesson(lesson.id));
  }, [lesson.id]);

  const title = getLessonTitle(t, lesson.titleKey);
  const description = getLessonDescription(t, lesson.descriptionKey);
  const categoryLabel = t.categories[lesson.category] ?? lesson.category;
  const difficultyLabel = t.difficulty[lesson.difficulty];

  if (!unlocked) {
    return (
      <div className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 p-5 opacity-60">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-[var(--color-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
            {t.home.locked}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">{difficultyLabel}</span>
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-muted)]">{title}</h3>
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{t.home.completePrevious}</p>
        <svg className="absolute right-4 top-4 text-[var(--color-text-muted)]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
    );
  }

  return (
    <a
      href={`/lesson/${lesson.id}`}
      className={[
        'group block rounded-xl border bg-[var(--color-surface-elevated)] p-5 no-underline transition hover:shadow-md',
        recommended
          ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent)]',
      ].join(' ')}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            {categoryLabel}
          </span>
          {recommended && (
            <span className="rounded-full bg-[var(--color-key-target)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-key-target)]">
              ★
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">{difficultyLabel}</span>
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-accent)]">
          {t.home.startLesson} →
        </span>
        {bestWpm !== null && (
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {t.home.bestWpm}: <strong className="text-[var(--color-text)]">{bestWpm}</strong>
          </span>
        )}
      </div>
    </a>
  );
}

export function CurriculumBar() {
  const { t } = useApp();
  const [progress, setProgress] = useState(0);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);

  useEffect(() => {
    const completed = getCompletedLessonsMap();
    const forUnlock = Object.fromEntries(
      Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
    );
    setProgress(getCurriculumProgress(forUnlock));
    setRecommendedId(getRecommendedLessonId(forUnlock));
  }, []);

  return (
    <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--color-text)]">{t.home.curriculumProgress}</span>
        <span className="font-mono text-[var(--color-accent)]">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-correct)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {recommendedId && (() => {
        const lesson = LESSONS.find((l) => l.id === recommendedId);
        const name = lesson ? getLessonTitle(t, lesson.titleKey) : recommendedId;
        return (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            {t.home.recommended}: <span className="text-[var(--color-accent)]">{name}</span>
          </p>
        );
      })()}
    </div>
  );
}
