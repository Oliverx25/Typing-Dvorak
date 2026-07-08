import { useApp } from '@/contexts/AppProvider';
import { getAchievementText } from '@/i18n/achievements';
import type { CatalogEntry, UserAchievementProgress } from '@/utils/achievements/catalogTypes';
import { getCategoryIcon, TIER_VISUALS } from '@/utils/achievements/achievementIcons';
import { Icon } from '@/components/ui';

interface AchievementCardProps {
  achievement: CatalogEntry;
  userProgress: UserAchievementProgress;
  tierLabel: string;
  unlockedLabel: string;
  lockedLabel: string;
  progressLabel: string;
}

export default function AchievementCard({
  achievement,
  userProgress,
  tierLabel,
  unlockedLabel,
  lockedLabel,
  progressLabel,
}: AchievementCardProps) {
  const { locale } = useApp();
  const { title, description } = getAchievementText(achievement, locale);
  const isUnlocked = userProgress.unlockedAt != null;
  const isLocked = !isUnlocked && userProgress.currentProgress <= 0;
  const tierStyle = TIER_VISUALS[achievement.tier];
  const CategoryIcon = getCategoryIcon(achievement.category);
  const iconClassName = isUnlocked ? tierStyle.icon : 'text-[var(--color-text-muted)]';

  const progressPct =
    achievement.targetValue > 0
      ? Math.round((userProgress.currentProgress / achievement.targetValue) * 100)
      : 0;

  return (
    <article
      className={[
        'relative overflow-hidden rounded-2xl border p-5 transition',
        isUnlocked
          ? `${tierStyle.borderUnlocked} bg-[var(--color-surface-elevated)]/90 ${tierStyle.glow}`
          : `${tierStyle.border} bg-[var(--color-surface-elevated)]/60`,
        isLocked ? 'opacity-40' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            'flex size-14 shrink-0 items-center justify-center rounded-2xl border',
            isUnlocked
              ? `${tierStyle.borderUnlocked} bg-[var(--color-surface)]`
              : `${tierStyle.border} bg-[var(--color-surface)]/50`,
          ].join(' ')}
        >
          {isLocked ? (
            <Icon name="lock" size={28} className={iconClassName} />
          ) : (
            <CategoryIcon size={28} strokeWidth={1.75} className={iconClassName} aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              {title}
            </h2>
            <span
              className={[
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                tierStyle.border,
                tierStyle.icon,
              ].join(' ')}
            >
              {tierLabel}
            </span>
            {isUnlocked ? (
              <span className="rounded-full bg-[var(--color-highlight)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-highlight)]">
                {unlockedLabel}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                <Icon name="lock" size={10} />
                {lockedLabel}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>
      </div>

      {!isUnlocked && achievement.targetValue > 1 ? (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>{progressLabel}</span>
            <span className="font-mono">
              {userProgress.currentProgress}/{achievement.targetValue}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={['h-full rounded-full transition-all', tierStyle.bar].join(' ')}
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
