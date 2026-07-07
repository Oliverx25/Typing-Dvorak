import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { useFocusedChapter } from '@/contexts/FocusedChapterProvider';
import { t as translate } from '@/i18n';
import { getLessonById } from '@/utils/curriculum/lessons';
import { isMicroLessonId } from '@/utils/curriculum/microLessonCatalog';
import { useLessonCardState } from '@/hooks/useLessonCardState';
import { BestScoreLabel, LockIcon } from '@/components/ui';
import LessonMasteryPanel from '@/components/lessons/LessonMasteryPanel';
import { MASTERY_RING_CLASSES } from '@/utils/curriculum/mastery';

interface HeroLessonCardProps {
  lessonId: string;
}

function resolveTitle(
  t: ReturnType<typeof useApp>['t'],
  lessonId: string,
  titleKey: string,
): string {
  if (isMicroLessonId(lessonId)) {
    return t.microLessonMeta[titleKey as keyof typeof t.microLessonMeta]?.title ?? titleKey;
  }
  return getLessonTitle(t, titleKey);
}

export default function HeroLessonCard({ lessonId }: HeroLessonCardProps) {
  const { t, locale } = useApp();
  const { recommendedId } = useFocusedChapter();
  const { unlocked, highestGrade, highestScore, masteryTier } = useLessonCardState(lessonId);
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;

  const title = resolveTitle(t, lessonId, lesson.titleKey);
  const isRecommended = lessonId === recommendedId;
  const ringClass = MASTERY_RING_CLASSES[masteryTier];
  const actionLabel = isRecommended
    ? translate(locale, 'home.continueWith', { lesson: title })
    : translate(locale, 'home.reviewLesson', { lesson: title });

  if (!unlocked) {
    return (
      <div className="flex min-h-[10rem] flex-col justify-between rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-surface-elevated)]/40 p-4 opacity-50">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</p>
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
            {t.difficulty[lesson.difficulty]}
          </p>
        </div>
        <LockIcon size={16} className="self-end text-[var(--color-text-muted)]" />
      </div>
    );
  }

  return (
    <article
      className={[
        'flex min-h-[10rem] flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4',
        ringClass,
      ].join(' ')}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-highlight)]">
          {t.difficulty[lesson.difficulty]}
        </p>
        <h3 className="mt-1 text-base font-semibold text-[var(--color-text)]">{title}</h3>
        <BestScoreLabel
          highestGrade={highestGrade}
          highestScore={highestScore}
          scoreUnit={t.multiplayer.raceScore}
          className="mt-2"
        />
        <LessonMasteryPanel lessonId={lessonId} size="sm" className="mt-2" />
      </div>

      <a
        href={`/lesson/${lessonId}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-highlight)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white no-underline transition hover:bg-[var(--color-highlight-hover)]"
      >
        {actionLabel}
      </a>
    </article>
  );
}
