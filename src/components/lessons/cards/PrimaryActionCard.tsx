import { useRef } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useFocusedChapter } from '@/contexts/FocusedChapterProvider';
import { useRoadmap } from '@/contexts/RoadmapProvider';
import { useChapterStats } from '@/hooks/useChapterStats';
import { getRoadmapChapter } from '@/utils/curriculum/roadmapChapters';
import CircularProgress from '@/components/ui/display/CircularProgress';
import { GradeBadge } from '@/components/ui';
import HeroLessonCard from '@/components/lessons/cards/HeroLessonCard';

export default function PrimaryActionCard() {
  const { t } = useApp();
  const { selectedChapterId, isRecommendedChapter, selectRecommendedChapter } = useFocusedChapter();
  const { globalProgress } = useRoadmap();
  const chapterStats = useChapterStats();
  const sectionRef = useRef<HTMLElement>(null);

  const chapter = getRoadmapChapter(selectedChapterId);
  if (!chapter) return null;

  const stats = chapterStats[selectedChapterId];
  const meta = t.chapterMeta[chapter.titleKey as keyof typeof t.chapterMeta];

  return (
    <section ref={sectionRef} className="mb-10 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {isRecommendedChapter ? t.home.yourNextStep : t.home.selectedChapter}
        </p>
        {!isRecommendedChapter && (
          <button
            type="button"
            onClick={selectRecommendedChapter}
            className="text-xs text-[var(--color-highlight)] transition hover:underline"
          >
            {t.home.backToRecommended}
          </button>
        )}
      </div>

      <article className="overflow-hidden rounded-2xl border-2 border-[var(--color-highlight)]/35 bg-[var(--color-surface-elevated)] shadow-lg shadow-[var(--color-highlight)]/10">
        <div className="flex flex-col gap-6 border-b border-[var(--color-border)] p-6 sm:flex-row sm:items-start">
          <CircularProgress value={globalProgress} />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-highlight)]">
              {meta?.title ?? chapter.titleKey}
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <p className="text-3xl font-light tabular-nums text-[var(--color-text)]">
                {stats?.completionPercentage ?? 0}%
              </p>
              {stats?.averageGrade ? (
                <GradeBadge grade={stats.averageGrade} className="!h-7 !w-auto !px-2 !text-xs" />
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {meta?.description}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {stats?.averageMasteryXp ?? 0} {t.home.chapterAvgMastery}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {chapter.lessonIds.map((lessonId) => (
            <HeroLessonCard key={lessonId} lessonId={lessonId} />
          ))}
        </div>
      </article>
    </section>
  );
}
