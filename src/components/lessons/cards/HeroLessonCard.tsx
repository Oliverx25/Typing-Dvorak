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
      <div className="flex items-center justify-between rounded-md border border-slate-800/40 bg-slate-900/40 p-3 opacity-50 grayscale">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">{title}</span>
        <LockIcon size={16} className="shrink-0 text-slate-500" />
      </div>
    );
  }

  return (
    <article
      className={[
        'flex flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4',
        ringClass,
      ].join(' ')}
    >
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
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
        className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-highlight)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white no-underline transition hover:bg-[var(--color-highlight-hover)]"
      >
        {actionLabel}
      </a>
    </article>
  );
}
