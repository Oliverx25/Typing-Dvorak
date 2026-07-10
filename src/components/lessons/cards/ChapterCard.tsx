import { useApp } from '@/contexts/AppProvider';
import { useFocusedChapter } from '@/contexts/FocusedChapterProvider';
import type { ChapterStats } from '@/utils/curriculum/chapterStats';
import type { RoadmapChapter } from '@/utils/curriculum/roadmapChapters';
import type { IconName } from '@/components/ui/icons/Icon';
import { GradeBadge, Icon, LockIcon } from '@/components/ui';
import ChapterProgressBar from '@/components/ui/display/ChapterProgressBar';

const CHAPTER_ICONS: Record<string, IconName> = {
  ch1_fundamentals: 'keyboard',
  ch2_top_expansion: 'chevron-up',
  ch3_bottom_reach: 'target',
  ch4_bilingual: 'book-open',
  ch5_mechanics: 'speed',
  ch6_development: 'sparkles',
  ch7_fire_test: 'trophy',
};

interface ChapterCardProps {
  chapter: RoadmapChapter;
  stats: ChapterStats;
  onSelect: () => void;
}

export default function ChapterCard({ chapter, stats, onSelect }: ChapterCardProps) {
  const { t } = useApp();
  const { selectedChapterId } = useFocusedChapter();
  const meta = t.chapterMeta[chapter.titleKey as keyof typeof t.chapterMeta];
  const isSelected = selectedChapterId === chapter.id;
  const icon = CHAPTER_ICONS[chapter.id] ?? 'star';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={stats.isLocked}
      className={[
        'group flex min-h-[10rem] w-full flex-col justify-between rounded-xl border p-5 text-left transition-all',
        'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md',
        'dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700 dark:hover:bg-slate-900',
        isSelected ? 'ring-2 ring-[var(--color-highlight)]/40 border-[var(--color-highlight)]/30' : '',
        stats.isLocked ? 'pointer-events-none opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {meta?.title ?? chapter.titleKey}
        </p>
        {stats.isLocked ? (
          <LockIcon size={16} className="shrink-0 text-slate-400" />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[var(--color-highlight)] dark:bg-slate-800">
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>

      <div className="my-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-light tabular-nums text-slate-900 dark:text-white">
            {stats.completionPercentage}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {stats.completedLessons}/{stats.totalLessons} {t.home.chapterLessonsDone}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {stats.averageMasteryXp} {t.home.chapterAvgMastery}
          </p>
        </div>
        {stats.averageGrade ? (
          <GradeBadge grade={stats.averageGrade} className="!h-7 !w-auto !px-2 !text-xs" />
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            {t.home.notPlayed}
          </span>
        )}
      </div>

      <ChapterProgressBar value={stats.masteryProgressPct} />
    </button>
  );
}
