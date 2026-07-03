import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppProvider';
import LessonCard, { CurriculumBar } from './LessonCard';
import SessionHistory from './SessionHistory';
import KeyboardHeatmap from './KeyboardHeatmap';
import QwertyComparison from './QwertyComparison';
import { LESSONS } from '../utils/lessons';
import { getRecommendedLessonId } from '../utils/curriculum';
import { getCompletedLessonsMap } from '../utils/storage';

export default function HomePage() {
  const { t } = useApp();
  const [recommendedId, setRecommendedId] = useState<string | null>(null);

  useEffect(() => {
    const completed = getCompletedLessonsMap();
    const forUnlock = Object.fromEntries(
      Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
    );
    setRecommendedId(getRecommendedLessonId(forUnlock));
  }, []);

  return (
    <>
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
          {t.home.title}{' '}
          <span className="text-[var(--color-accent)]">{t.home.titleAccent}</span>
          {t.home.titleEnd ? ` ${t.home.titleEnd}` : ''}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">{t.home.subtitle}</p>
      </section>

      <CurriculumBar />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{t.home.lessonsHeading}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {LESSONS.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} recommended={lesson.id === recommendedId} />
          ))}
        </div>
      </section>

      <SessionHistory />

      <KeyboardHeatmap />

      <section className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--color-text)]">{t.home.homeRowTitle}</h2>
        <p className="font-mono text-2xl tracking-[0.3em] text-[var(--color-accent)]">{t.home.homeRowKeys}</p>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t.home.homeRowDesc}</p>
      </section>

      <QwertyComparison />
    </>
  );
}
