import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { LESSON_GROUPS, type MicroLesson } from '@/data/microLessons';
import { Accordion, Badge, BestScoreLabel } from '@/components/ui';
import type { AccordionItem } from '@/components/ui';
import { useLessonCardState } from '@/hooks/useLessonCardState';

function MicroLessonLink({ micro }: { micro: MicroLesson }) {
  const { t } = useApp();
  const { unlocked, highestGrade, highestScore } = useLessonCardState(micro.id);
  const title =
    t.microLessonMeta[micro.titleKey as keyof typeof t.microLessonMeta]?.title ?? micro.titleKey;
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
      href={`/lesson/${micro.id}`}
      className="flex items-center justify-between rounded-lg px-3 py-2 no-underline transition hover:bg-[var(--color-surface)]/80"
    >
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
        <p className="font-mono text-xs tracking-widest text-[var(--color-highlight)]">{micro.chars}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <BestScoreLabel
          highestGrade={highestGrade}
          highestScore={highestScore}
          scoreUnit={t.multiplayer.raceScore}
        />
        <span className="text-xs text-[var(--color-text-muted)]">{difficulty}</span>
      </div>
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
