import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { LESSON_GROUPS, type MicroLesson } from '@/data/microLessons';
import { Accordion, Badge } from '@/components/ui';
import type { AccordionItem } from '@/components/ui';
import { isLessonUnlocked } from '@/utils/curriculum/curriculum';
import { getCompletedLessonsMap } from '@/utils/progress/storage';
import { useLessonCardState } from '@/hooks/useLessonCardState';

function MicroLessonLink({ micro }: { micro: MicroLesson }) {
  const { t } = useApp();
  const { unlocked } = useLessonCardState(micro.lessonId);
  const title = t.microLessons[micro.titleKey as keyof typeof t.microLessons] ?? micro.titleKey;
  const difficulty = t.difficulty[micro.difficulty];

  if (!unlocked) {
    return (
      <div className="flex items-center justify-between rounded-lg px-3 py-2 opacity-50">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
          <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)]">{micro.chars}</p>
        </div>
        <Badge variant="locked">{t.home.locked}</Badge>
      </div>
    );
  }

  return (
    <a
      href={`/lesson/${micro.lessonId}`}
      className="flex items-center justify-between rounded-lg px-3 py-2 no-underline transition hover:bg-[var(--color-surface)]/80"
    >
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
        <p className="font-mono text-xs tracking-widest text-[var(--color-highlight)]">{micro.chars}</p>
      </div>
      <span className="text-xs text-[var(--color-text-muted)]">{difficulty}</span>
    </a>
  );
}

export default function LessonAccordion() {
  const { t } = useApp();

  const items: AccordionItem[] = LESSON_GROUPS.map((group) => ({
    id: group.id,
    title: getLessonTitle(t, group.titleKey),
    subtitle: t.lessonMeta[group.descriptionKey as keyof typeof t.lessonMeta]?.description,
    defaultOpen: group.defaultOpen,
    badge: (
      <Badge variant="accent">
        {group.microLessons.length} {t.home.microLessons}
      </Badge>
    ),
    children: (
      <ul className="space-y-1">
        {group.microLessons.map((micro) => (
          <li key={micro.id}>
            <MicroLessonLink micro={micro} />
          </li>
        ))}
      </ul>
    ),
  }));

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{t.home.lessonsHeading}</h2>
      <Accordion items={items} />
    </section>
  );
}

/** Returns unlock map for a lesson id (used by parent if needed). */
export function isMicroLessonUnlocked(lessonId: string): boolean {
  const completed = getCompletedLessonsMap();
  const forUnlock = Object.fromEntries(
    Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
  );
  return isLessonUnlocked(lessonId, forUnlock);
}
