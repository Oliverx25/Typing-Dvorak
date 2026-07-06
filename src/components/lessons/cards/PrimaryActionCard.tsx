import { useEffect, useRef, useState } from 'react';
import { useApp, getLessonDescription, getLessonTitle } from '@/contexts/AppProvider';
import { useFocusedChapter } from '@/contexts/FocusedChapterProvider';
import { t as translate } from '@/i18n';
import { getLessonById } from '@/utils/curriculum/lessons';
import { findLessonGroup } from '@/utils/curriculum/microLessonGroups';
import CircularProgress from '@/components/ui/display/CircularProgress';
import { BestScoreLabel, Icon } from '@/components/ui';
import { useLessonCardState } from '@/hooks/useLessonCardState';

import type { MicroLesson } from '@/data/microLessons';

function MicroLessonRow({ micro, title }: { micro: MicroLesson; title: string }) {
  const { t } = useApp();
  const { highestGrade, highestScore } = useLessonCardState(micro.lessonId);

  return (
    <li>
      <a
        href={`/lesson/${micro.lessonId}`}
        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm no-underline transition hover:bg-[var(--color-surface-elevated)]"
      >
        <span className="min-w-0 truncate text-[var(--color-text)]">{title}</span>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <BestScoreLabel
            highestGrade={highestGrade}
            highestScore={highestScore}
            scoreUnit={t.multiplayer.raceScore}
          />
          <span className="font-mono text-xs tracking-widest text-[var(--color-highlight)]">
            {micro.chars}
          </span>
        </div>
      </a>
    </li>
  );
}

export default function PrimaryActionCard() {
  const { t, locale } = useApp();
  const { focusedLessonId, recommendedId, isRecommendedFocus, focusedProgress, setFocusedLessonId } =
    useFocusedChapter();
  const [microOpen, setMicroOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const prevFocused = useRef(focusedLessonId);

  useEffect(() => {
    if (prevFocused.current !== focusedLessonId) {
      setMicroOpen(true);
      prevFocused.current = focusedLessonId;
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedLessonId]);

  const lesson = getLessonById(focusedLessonId);
  if (!lesson) return null;

  const title = getLessonTitle(t, lesson.titleKey);
  const description = getLessonDescription(t, lesson.descriptionKey);
  const group = findLessonGroup(focusedLessonId, lesson.titleKey);
  const { highestGrade, highestScore } = useLessonCardState(focusedLessonId);

  const actionLabel = isRecommendedFocus
    ? translate(locale, 'home.continueWith', { lesson: title.toUpperCase() })
    : translate(locale, 'home.reviewLesson', { lesson: title.toUpperCase() });

  return (
    <section ref={sectionRef} className="mb-10 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {isRecommendedFocus ? t.home.yourNextStep : t.home.selectedChapter}
        </p>
        {!isRecommendedFocus && (
          <button
            type="button"
            onClick={() => setFocusedLessonId(recommendedId)}
            className="text-xs text-[var(--color-highlight)] transition hover:underline"
          >
            {t.home.backToRecommended}
          </button>
        )}
      </div>

      <article className="overflow-hidden rounded-2xl border-2 border-[var(--color-highlight)]/35 bg-[var(--color-surface-elevated)] shadow-lg shadow-[var(--color-highlight)]/10">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <CircularProgress value={focusedProgress} />

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold uppercase tracking-wide text-[var(--color-text)] sm:text-2xl">
              {title}
            </h2>
            <BestScoreLabel
              highestGrade={highestGrade}
              highestScore={highestScore}
              scoreUnit={t.multiplayer.raceScore}
              size="md"
              className="mt-2"
            />
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>

            <a
              href={`/lesson/${focusedLessonId}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-highlight)] px-6 py-3.5 text-base font-semibold uppercase tracking-wide text-white no-underline shadow-lg shadow-[var(--color-highlight)]/25 transition hover:bg-[var(--color-highlight-hover)]"
            >
              {actionLabel}
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
                  return <MicroLessonRow key={micro.id} micro={micro} title={microTitle} />;
                })}
              </ul>
            )}
          </div>
        )}
      </article>
    </section>
  );
}
