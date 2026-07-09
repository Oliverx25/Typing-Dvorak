import { useEffect, useMemo, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { getChapterForLesson, getRoadmapChapters } from '@/utils/curriculum/roadmapChapters';
import { getChapterShortTitleByKey } from '@/i18n/lessons';
import LessonCard from '@/components/multiplayer/setup/LessonCard';
import type { Lesson } from '@/utils/curriculum/lessons';
import type { RoadmapChapter } from '@/utils/curriculum/catalogTypes';

interface MultiplayerChapterLessonPickerProps {
  lessons: Lesson[];
  selectedId: string;
  onSelect: (lessonId: string) => void;
  disabled?: boolean;
}

interface ChapterWithLessons {
  chapter: RoadmapChapter;
  chapterNumber: number;
  lessons: Lesson[];
}

export default function MultiplayerChapterLessonPicker({
  lessons,
  selectedId,
  onSelect,
  disabled = false,
}: MultiplayerChapterLessonPickerProps) {
  const { t, locale } = useApp();
  const lessonMap = useMemo(() => new Map(lessons.map((lesson) => [lesson.id, lesson])), [lessons]);

  const chaptersWithLessons = useMemo<ChapterWithLessons[]>(() => {
    return getRoadmapChapters()
      .map((chapter, index) => ({
        chapter,
        chapterNumber: index + 1,
        lessons: chapter.lessonIds
          .map((id) => lessonMap.get(id))
          .filter((lesson): lesson is Lesson => Boolean(lesson)),
      }))
      .filter((entry) => entry.lessons.length > 0);
  }, [lessonMap]);

  const defaultChapterId =
    getChapterForLesson(selectedId)?.id ?? chaptersWithLessons[0]?.chapter.id ?? '';

  const [activeChapterId, setActiveChapterId] = useState(defaultChapterId);

  useEffect(() => {
    const chapter = getChapterForLesson(selectedId);
    if (chapter) setActiveChapterId(chapter.id);
  }, [selectedId]);

  const activeChapter = chaptersWithLessons.find((entry) => entry.chapter.id === activeChapterId);

  return (
    <div className="flex flex-col">
      <div
        role="tablist"
        aria-label={t.multiplayer.systemLesson}
        className="mb-4 flex gap-2 overflow-x-auto border-b border-slate-200/80 pb-2 dark:border-slate-800/50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {chaptersWithLessons.map(({ chapter, chapterNumber }) => {
          const isActive = chapter.id === activeChapterId;
          const label = getChapterShortTitleByKey(chapter.titleKey, locale, chapterNumber);

          return (
            <button
              key={chapter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={disabled}
              onClick={() => setActiveChapterId(chapter.id)}
              className={[
                'shrink-0 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-slate-200 font-medium text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50',
                disabled ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="h-[min(400px,50vh)] overflow-y-auto pr-2">
        {activeChapter ? (
          <div
            role="tabpanel"
            className="grid grid-cols-2 gap-3"
          >
            {activeChapter.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                title={getLessonTitle(t, lesson.titleKey)}
                category={t.categories[lesson.category] ?? lesson.category}
                difficulty={t.difficulty[lesson.difficulty]}
                isActive={lesson.id === selectedId}
                disabled={disabled}
                onSelect={() => onSelect(lesson.id)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
