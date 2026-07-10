import type { ReactNode } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import type { StatsInsights } from '@/utils/stats/statsInsights';

interface ActionableInsightsProps {
  insights: StatsInsights;
}

function InsightCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </p>
      <div className="mt-2 flex flex-1 flex-col justify-between gap-3">
        <div className="text-sm text-[var(--color-text)]">{children}</div>
        {action}
      </div>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-highlight)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-highlight-hover)]"
    >
      {label}
    </a>
  );
}

export default function ActionableInsights({ insights }: ActionableInsightsProps) {
  const { t } = useApp();
  const labels = t.stats.insights;

  const lowestWpmTitle = insights.lowestWpmLesson
    ? getLessonTitle(t, insights.lowestWpmLesson.titleKey)
    : labels.noData;
  const lowestAccuracyTitle = insights.lowestAccuracyLesson
    ? getLessonTitle(t, insights.lowestAccuracyLesson.titleKey)
    : labels.noData;

  const troubleKeysText =
    insights.troubleKeys.length > 0
      ? insights.troubleKeys.slice(0, 6).join(', ')
      : labels.noTroubleKeys;

  return (
    <div className="mt-8 mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <InsightCard
        title={labels.needsSpeed}
        action={
          insights.lowestWpmLesson ? (
            <ActionButton
              href={`/lesson/${insights.lowestWpmLesson.id}`}
              label={labels.goToLesson}
            />
          ) : null
        }
      >
        <p className="font-medium">{lowestWpmTitle}</p>
        {insights.lowestWpmLesson ? (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {insights.lowestWpmLesson.wpm} {t.stats.wpm.toLowerCase()}
          </p>
        ) : null}
      </InsightCard>

      <InsightCard
        title={labels.needsAccuracy}
        action={
          insights.lowestAccuracyLesson ? (
            <ActionButton
              href={`/lesson/${insights.lowestAccuracyLesson.id}`}
              label={labels.goToLesson}
            />
          ) : null
        }
      >
        <p className="font-medium">{lowestAccuracyTitle}</p>
        {insights.lowestAccuracyLesson ? (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {insights.lowestAccuracyLesson.accuracy}% {t.stats.accuracy.toLowerCase()}
          </p>
        ) : null}
      </InsightCard>

      <InsightCard
        title={
          insights.suggestedAction === 'adaptive'
            ? labels.suggestedAdaptive
            : labels.suggestedRetry
        }
        action={
          insights.suggestedAction === 'adaptive' ? (
            <ActionButton href="/lesson/adaptive-drill" label={labels.startDrill} />
          ) : insights.retryLessonId ? (
            <ActionButton
              href={`/lesson/${insights.retryLessonId}`}
              label={labels.retryLesson}
            />
          ) : null
        }
      >
        {insights.suggestedAction === 'adaptive' ? (
          <p className="text-[var(--color-text-muted)]">
            {labels.focusOnKeys.replace('{keys}', troubleKeysText)}
          </p>
        ) : (
          <p className="text-[var(--color-text-muted)]">
            {labels.improveOnLesson.replace('{lesson}', lowestWpmTitle)}
          </p>
        )}
      </InsightCard>
    </div>
  );
}
