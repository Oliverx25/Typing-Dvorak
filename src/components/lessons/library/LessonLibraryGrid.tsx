import { useApp } from '@/contexts/AppProvider';
import { useFocusedChapter } from '@/contexts/FocusedChapterProvider';
import { useRoadmap } from '@/contexts/RoadmapProvider';
import { useChapterStats } from '@/hooks/useChapterStats';
import { ROADMAP_CHAPTERS } from '@/utils/curriculum/roadmapChapters';
import ChapterCard from '@/components/lessons/cards/ChapterCard';

function RoadmapArchiveToggle() {
  const { t } = useApp();
  const { archiveOpen, toggleArchive } = useRoadmap();

  return (
    <button
      type="button"
      onClick={toggleArchive}
      className="mb-6 flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-left text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-highlight)]/40"
    >
      <span>{archiveOpen ? t.home.hideRoadmapArchive : t.home.viewRoadmapArchive}</span>
      <span className="text-[var(--color-highlight)]">{archiveOpen ? '▲' : '▼'}</span>
    </button>
  );
}

export default function LessonLibraryGrid() {
  const { t } = useApp();
  const { isRoadmapComplete, archiveOpen, globalProgress } = useRoadmap();
  const { setSelectedChapterId } = useFocusedChapter();
  const chapterStats = useChapterStats();
  const showChapters = !isRoadmapComplete || archiveOpen;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
          {isRoadmapComplete ? t.home.roadmapArchive : t.home.lessonLibrary}
        </h2>
        {!isRoadmapComplete && (
          <span className="text-xs font-mono text-[var(--color-highlight)]">{globalProgress}%</span>
        )}
      </div>

      {isRoadmapComplete && <RoadmapArchiveToggle />}

      {showChapters && (
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
      )}
    </section>
  );
}
