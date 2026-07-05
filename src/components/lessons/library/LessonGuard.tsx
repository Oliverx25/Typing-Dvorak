import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { isLessonUnlocked } from '@/utils/curriculum/curriculum';
import { getCompletedLessonsMap } from '@/utils/progress/storage';

export default function LessonGuard({ lessonId, children }: { lessonId: string; children: React.ReactNode }) {
  const { t } = useApp();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const completed = getCompletedLessonsMap();
    const forUnlock = Object.fromEntries(
      Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
    );
    setUnlocked(isLessonUnlocked(lessonId, forUnlock));
  }, [lessonId]);

  if (unlocked === null) return null;

  if (!unlocked) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-10 text-center">
        <svg className="mx-auto mb-4 text-[var(--color-text-muted)]" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect width="18" height="11" x="3" y="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h2 className="text-xl font-bold text-[var(--color-text)]">{t.lesson.lockedTitle}</h2>
        <p className="mt-2 text-[var(--color-text-muted)]">{t.lesson.lockedDesc}</p>
        <a href="/lessons" className="mt-6 inline-block rounded-lg bg-[var(--color-highlight)] px-6 py-2.5 font-medium text-white no-underline hover:bg-[var(--color-highlight-hover)]">
          {t.lesson.goBack}
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
