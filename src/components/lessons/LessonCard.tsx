import { useEffect, useState } from 'react';
import { useApp, getLessonDescription, getLessonTitle } from '@/contexts/AppProvider';
import { getRecommendedLessonId, getCurriculumProgress } from '@/utils/curriculum';
import { getCompletedLessonsMap } from '@/utils/storage';
import type { Lesson } from '@/utils/lessons';
import { CORE_LESSONS } from '@/utils/lessons';
import { SESSION_COMPLETE_EVENT } from '@/utils/events';
import { useLessonCardState } from '@/hooks/useLessonCardState';
import { Card, Badge, LockIcon } from '@/components/ui';

interface LessonCardProps {
  lesson: Lesson;
  recommended?: boolean;
}

interface CardMetaProps {
  locked: boolean;
  categoryLabel: string;
  difficultyLabel: string;
  recommended?: boolean;
  lockedLabel: string;
}

function CardMeta({ locked, categoryLabel, difficultyLabel, recommended, lockedLabel }: CardMetaProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {locked ? (
          <Badge variant="locked">{lockedLabel}</Badge>
        ) : (
          <>
            <Badge variant="accent">{categoryLabel}</Badge>
            {recommended && <Badge variant="target">★</Badge>}
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
        <span>{difficultyLabel}</span>
        {locked && <LockIcon size={14} />}
      </div>
    </div>
  );
}

function LockedLessonCard({
  title,
  difficultyLabel,
  lockedLabel,
  completePrevious,
}: {
  title: string;
  difficultyLabel: string;
  lockedLabel: string;
  completePrevious: string;
}) {
  return (
    <Card variant="muted" padding="md">
      <CardMeta locked categoryLabel="" difficultyLabel={difficultyLabel} lockedLabel={lockedLabel} />
      <h3 className="text-lg font-semibold text-[var(--color-text-muted)]">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{completePrevious}</p>
    </Card>
  );
}

function UnlockedLessonCard({
  lesson,
  title,
  description,
  categoryLabel,
  difficultyLabel,
  recommended,
  bestWpm,
  startLabel,
  bestWpmLabel,
}: {
  lesson: Lesson;
  title: string;
  description: string;
  categoryLabel: string;
  difficultyLabel: string;
  recommended?: boolean;
  bestWpm: number | null;
  startLabel: string;
  bestWpmLabel: string;
}) {
  return (
    <Card
      as="a"
      href={`/lesson/${lesson.id}`}
      variant={recommended ? 'highlight' : 'default'}
      padding="md"
      className="group block no-underline hover:shadow-md"
    >
      <CardMeta
        locked={false}
        categoryLabel={categoryLabel}
        difficultyLabel={difficultyLabel}
        recommended={recommended}
        lockedLabel=""
      />
      <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-highlight)]">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-highlight)]">{startLabel} →</span>
        {bestWpm !== null && (
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {bestWpmLabel}: <strong className="text-[var(--color-text)]">{bestWpm}</strong>
          </span>
        )}
      </div>
    </Card>
  );
}

export default function LessonCard({ lesson, recommended = false }: LessonCardProps) {
  const { t } = useApp();
  const { unlocked, bestWpm } = useLessonCardState(lesson.id);

  const title = getLessonTitle(t, lesson.titleKey);
  const description = getLessonDescription(t, lesson.descriptionKey);
  const categoryLabel = t.categories[lesson.category] ?? lesson.category;
  const difficultyLabel = t.difficulty[lesson.difficulty];

  if (!unlocked) {
    return (
      <LockedLessonCard
        title={title}
        difficultyLabel={difficultyLabel}
        lockedLabel={t.home.locked}
        completePrevious={t.home.completePrevious}
      />
    );
  }

  return (
    <UnlockedLessonCard
      lesson={lesson}
      title={title}
      description={description}
      categoryLabel={categoryLabel}
      difficultyLabel={difficultyLabel}
      recommended={recommended}
      bestWpm={bestWpm}
      startLabel={t.home.startLesson}
      bestWpmLabel={t.home.bestWpm}
    />
  );
}

export function CurriculumBar() {
  const { t } = useApp();
  const [progress, setProgress] = useState(0);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      const completed = getCompletedLessonsMap();
      const forUnlock = Object.fromEntries(
        Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
      );
      setProgress(getCurriculumProgress(forUnlock));
      setRecommendedId(getRecommendedLessonId(forUnlock));
    };
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, []);

  return (
    <Card padding="md" className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--color-text)]">{t.home.curriculumProgress}</span>
        <span className="font-mono text-[var(--color-highlight)]">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-highlight-hover)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {recommendedId && (() => {
        const lesson = CORE_LESSONS.find((l) => l.id === recommendedId);
        const name = lesson ? getLessonTitle(t, lesson.titleKey) : recommendedId;
        return (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            {t.home.recommended}: <span className="text-[var(--color-highlight)]">{name}</span>
          </p>
        );
      })()}
    </Card>
  );
}
