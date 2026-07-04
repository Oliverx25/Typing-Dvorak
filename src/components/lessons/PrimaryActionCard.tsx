import { useState } from 'react';
import { useApp, getLessonDescription, getLessonTitle } from '@/contexts/AppProvider';
import { t as translate } from '@/i18n';
import { getLessonById } from '@/utils/lessons';
import { LESSON_GROUPS } from '@/data/microLessons';
import { useCurriculumState } from '@/hooks/useCurriculumState';
import CircularProgress from '@/components/ui/CircularProgress';
import { Icon } from '@/components/ui';

export default function PrimaryActionCard() {
  const { t, locale } = useApp();
  const { progress, recommendedId } = useCurriculumState();
  const [microOpen, setMicroOpen] = useState(false);

  const lesson = getLessonById(recommendedId);
  if (!lesson) return null;

  const title = getLessonTitle(t, lesson.titleKey);
  const description = getLessonDescription(t, lesson.descriptionKey);
  const group = LESSON_GROUPS.find((g) => g.microLessons.some((m) => m.lessonId === recommendedId));
  const continueLabel = translate(locale, 'home.continueWith', { lesson: title.toUpperCase() });

  return (
    <section className="mb-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {t.home.yourNextStep}
      </p>

      <article className="overflow-hidden rounded-2xl border-2 border-[var(--color-highlight)]/35 bg-[var(--color-surface-elevated)] shadow-lg shadow-[var(--color-highlight)]/10">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <CircularProgress value={progress} />

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold uppercase tracking-wide text-[var(--color-text)] sm:text-2xl">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>

            <a
              href={`/lesson/${recommendedId}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-highlight)] px-6 py-3.5 text-base font-semibold uppercase tracking-wide text-white no-underline shadow-lg shadow-[var(--color-highlight)]/25 transition hover:bg-[var(--color-highlight-hover)]"
            >
              {continueLabel}
            </a>
          </div>
        </div>

        {group && group.microLessons.length > 0 && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/40">
            <button
              type="button"
              onClick={() => setMicroOpen((o) => !o)}
              className="flex w-full items-center gap-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            >
              <Icon name={microOpen ? 'chevron-down' : 'chevron-right'} size={16} />
              {title} — {group.microLessons.length} {t.home.microLessons}
            </button>

            {microOpen && (
              <ul className="space-y-1 border-t border-[var(--color-border)] px-4 py-3">
                {group.microLessons.map((micro) => {
                  const microTitle =
                    t.microLessons[micro.titleKey as keyof typeof t.microLessons] ?? micro.titleKey;
                  return (
                    <li key={micro.id}>
                      <a
                        href={`/lesson/${micro.lessonId}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm no-underline transition hover:bg-[var(--color-surface-elevated)]"
                      >
                        <span className="text-[var(--color-text)]">{microTitle}</span>
                        <span className="font-mono text-xs tracking-widest text-[var(--color-highlight)]">
                          {micro.chars}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </article>
    </section>
  );
}
