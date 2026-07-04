import type { TranslationKey } from '@/i18n';
import { getLessonTitle } from '@/contexts/AppProvider';
import type { Lesson } from '@/utils/curriculum/lessons';
import { LESSON_GRID_GROUPS } from '@/utils/multiplayer/roomConfig';
import LessonCard from '@/components/multiplayer/LessonCard';

interface LessonGridProps {
  lessons: Lesson[];
  selectedId: string;
  onSelect: (lessonId: string) => void;
  disabled?: boolean;
  t: TranslationKey;
}

const groupTitleKeys = {
  basics: 'lessonGroupBasics',
  symbols: 'lessonGroupSymbols',
  advanced: 'lessonGroupAdvanced',
} as const;

export default function LessonGrid({
  lessons,
  selectedId,
  onSelect,
  disabled = false,
  t,
}: LessonGridProps) {
  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  return (
    <div className="space-y-6">
      {LESSON_GRID_GROUPS.map((group) => {
        const groupLessons = group.lessonIds
          .map((id) => lessonMap.get(id))
          .filter((lesson): lesson is Lesson => Boolean(lesson));

        if (groupLessons.length === 0) return null;

        const titleKey = groupTitleKeys[group.id];

        return (
          <section key={group.id}>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t.multiplayer[titleKey]}
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {groupLessons.map((lesson) => (
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
          </section>
        );
      })}
    </div>
  );
}
