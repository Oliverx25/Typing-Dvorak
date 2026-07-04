import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import {
  BADGES,
  buildBadgeEvaluationFromLocal,
  getBadgeProgressState,
  getUnlockedBadges,
} from '@/utils/badges';
import { BADGES_UPDATED_EVENT, SESSION_COMPLETE_EVENT } from '@/utils/events';
import { BadgeIcon, Icon } from '@/components/ui';

export default function AchievementsGrid() {
  const { t } = useApp();
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState(buildBadgeEvaluationFromLocal);

  const refresh = () => {
    setUnlocked(getUnlockedBadges());
    setEvaluation(buildBadgeEvaluationFromLocal());
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, handler);
    window.addEventListener(BADGES_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(SESSION_COMPLETE_EVENT, handler);
      window.removeEventListener(BADGES_UPDATED_EVENT, handler);
    };
  }, []);

  const unlockedCount = BADGES.filter((badge) => unlocked.includes(badge.id)).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryTile label={t.achievements.unlockedCount} value={String(unlockedCount)} accent />
        <SummaryTile label={t.achievements.totalCount} value={String(BADGES.length)} />
        <SummaryTile
          label={t.achievements.completionRate}
          value={`${Math.round((unlockedCount / BADGES.length) * 100)}%`}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {BADGES.map((badge) => {
          const isUnlocked = unlocked.includes(badge.id);
          const progress = getBadgeProgressState(badge.id, evaluation);
          const title = t.badges[badge.titleKey as keyof typeof t.badges];
          const description = t.badges[badge.descKey as keyof typeof t.badges];
          const progressPct =
            progress && progress.target > 0
              ? Math.round((progress.current / progress.target) * 100)
              : 0;

          return (
            <article
              key={badge.id}
              className={[
                'relative overflow-hidden rounded-2xl border p-5 transition',
                isUnlocked
                  ? 'border-[var(--color-highlight)]/35 bg-[var(--color-highlight)]/8 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-highlight)_12%,transparent)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]/60',
              ].join(' ')}
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    'flex size-14 shrink-0 items-center justify-center rounded-2xl border',
                    isUnlocked
                      ? 'border-[var(--color-highlight)]/25 bg-[var(--color-surface)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]/50 opacity-45 grayscale',
                  ].join(' ')}
                >
                  <BadgeIcon src={badge.icon} size={30} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
                    {isUnlocked ? (
                      <span className="rounded-full bg-[var(--color-highlight)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-highlight)]">
                        {t.achievements.unlockedLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                        <Icon name="lock" size={10} />
                        {t.achievements.lockedLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
                </div>
              </div>

              {!isUnlocked && progress && (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>{t.achievements.progressLabel}</span>
                    <span className="font-mono">
                      {progress.current}/{progress.target}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]/60">
                    <div
                      className="h-full rounded-full bg-[var(--color-highlight)] transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  accent = false,
  className = '',
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-5 text-center',
        className,
      ].join(' ')}
    >
      <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
      <p
        className={[
          'mt-2 font-mono text-3xl font-bold',
          accent ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text)]',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}
