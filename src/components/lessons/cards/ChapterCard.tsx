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
        'flex min-h-[11rem] w-full flex-col justify-between rounded-xl border p-6 text-left transition',
        'bg-slate-900/80 border-slate-800 hover:border-slate-600',
        isSelected ? 'ring-2 ring-[var(--color-highlight)]/50 border-[var(--color-highlight)]/40' : '',
        stats.isLocked ? 'pointer-events-none opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {meta?.title ?? chapter.titleKey}
          </p>
        </div>
        {stats.isLocked ? (
          <LockIcon size={16} className="shrink-0 text-slate-500" />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[var(--color-highlight)]">
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>

      <div className="my-4">
        <p className="text-3xl font-light tabular-nums text-[var(--color-text)]">
          {stats.completionPercentage}%
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {stats.completedLessons}/{stats.totalLessons} {t.home.chapterLessonsDone}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {stats.averageGrade ? (
            <GradeBadge grade={stats.averageGrade} className="!h-6 !w-auto !px-1.5 !text-xs" />
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              {t.home.notPlayed}
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-500">
            {stats.averageMasteryXp} XP
          </span>
        </div>
        <ChapterProgressBar value={stats.masteryProgressPct} />
      </div>
    </button>
  );
}
