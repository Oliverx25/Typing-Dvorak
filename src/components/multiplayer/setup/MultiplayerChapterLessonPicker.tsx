import { useState, type ReactNode } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { getRoadmapChapters } from '@/utils/curriculum/roadmapChapters';
import { getChapterTitleByKey } from '@/i18n/lessons';
import LessonCard from '@/components/multiplayer/setup/LessonCard';
import Icon from '@/components/ui/icons/Icon';
import type { Lesson } from '@/utils/curriculum/lessons';

interface MultiplayerChapterLessonPickerProps {
  lessons: Lesson[];
  selectedId: string;
  onSelect: (lessonId: string) => void;
  disabled?: boolean;
}

export default function MultiplayerChapterLessonPicker({
  lessons,
  selectedId,
  onSelect,
  disabled = false,
}: MultiplayerChapterLessonPickerProps) {
  const { t, locale } = useApp();
  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const chapters = getRoadmapChapters();

  return (
    <div className="space-y-2">
      {chapters.map((chapter, index) => {
        const chapterLessons = chapter.lessonIds
          .map((id) => lessonMap.get(id))
          .filter((lesson): lesson is Lesson => Boolean(lesson));

        if (chapterLessons.length === 0) return null;

        const chapterTitle = getChapterTitleByKey(chapter.titleKey, locale);

        return (
          <ChapterAccordion
            key={chapter.id}
            title={chapterTitle}
            subtitle={`${chapterLessons.length} lessons`}
            defaultOpen={index === 0}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {chapterLessons.map((lesson) => (
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
          </ChapterAccordion>
        );
      })}
    </div>
  );
}

function ChapterAccordion({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        <Icon
          name={open ? 'chevron-down' : 'chevron-right'}
          size={18}
          className="shrink-0 text-slate-400"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          {subtitle ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
      </button>
      <div
        className={[
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">{children}</div>
        </div>
      </div>
    </div>
  );
}
