import { useApp } from '@/contexts/AppProvider';
import { useFocusedChapter } from '@/contexts/FocusedChapterProvider';
import { useRoadmap } from '@/contexts/RoadmapProvider';
import { useChapterStats } from '@/hooks/useChapterStats';
import { ROADMAP_CHAPTERS } from '@/utils/curriculum/roadmapChapters';
import ChapterCard from '@/components/lessons/cards/ChapterCard';

export default function LessonLibraryGrid() {
  const { t } = useApp();
  const { globalProgress } = useRoadmap();
  const { setSelectedChapterId } = useFocusedChapter();
  const chapterStats = useChapterStats();

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
          {t.home.lessonLibrary}
        </h2>
        <span className="font-mono text-xs text-[var(--color-highlight)]">{globalProgress}%</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ROADMAP_CHAPTERS.map((chapter) => {
          const stats = chapterStats[chapter.id];
          if (!stats) return null;

          return (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              stats={stats}
              onSelect={() => setSelectedChapterId(chapter.id, { scrollToTop: true })}
            />
          );
        })}
      </div>
    </section>
  );
}
