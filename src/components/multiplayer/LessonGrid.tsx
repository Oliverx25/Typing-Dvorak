import type { TranslationKey } from '@/i18n';
import { getLessonTitle } from '@/contexts/AppProvider';
import type { Lesson } from '@/utils/curriculum/lessons';
import { LESSON_GRID_GROUPS } from '@/utils/multiplayer/roomConfig';

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
    <div className="max-h-[28rem] overflow-y-auto pr-1">
      <div className="space-y-4">
        {LESSON_GRID_GROUPS.map((group) => {
          const groupLessons = group.lessonIds
            .map((id) => lessonMap.get(id))
            .filter((lesson): lesson is Lesson => Boolean(lesson));

          if (groupLessons.length === 0) return null;

          const titleKey = groupTitleKeys[group.id];

          return (
            <section key={group.id}>
              <h3 className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {t.multiplayer[titleKey]}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {groupLessons.map((lesson) => {
                  const isSelected = lesson.id === selectedId;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(lesson.id)}
                      className={[
                        'min-h-16 rounded-xl border px-3 py-3 text-left text-xs font-medium transition',
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-text)] ring-1 ring-[var(--color-accent)]/40'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]/40 hover:text-[var(--color-text)]',
                        disabled ? 'cursor-not-allowed opacity-50' : '',
                      ].join(' ')}
                    >
                      {getLessonTitle(t, lesson.titleKey)}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
