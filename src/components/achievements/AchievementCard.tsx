import { Icon } from '@/components/ui';
import type { AchievementTier } from '@/utils/achievements/achievements.config';
import { SPECIAL_ACHIEVEMENT_STYLE, TIER_STYLES } from '@/utils/achievements/tierStyles';
import type { Badge } from '@/utils/achievements/badges';

interface AchievementCardProps {
  badge: Badge;
  title: string;
  description: string;
  isUnlocked: boolean;
  progress: { current: number; target: number } | null;
  unlockedLabel: string;
  lockedLabel: string;
  progressLabel: string;
  tierLabel?: string;
}

export default function AchievementCard({
  badge,
  title,
  description,
  isUnlocked,
  progress,
  unlockedLabel,
  lockedLabel,
  progressLabel,
  tierLabel,
}: AchievementCardProps) {
  const tierStyle = badge.tier ? TIER_STYLES[badge.tier] : SPECIAL_ACHIEVEMENT_STYLE;
  const progressPct =
    progress && progress.target > 0
      ? Math.round((progress.current / progress.target) * 100)
      : 0;

  return (
    <article
      className={[
        'relative overflow-hidden rounded-2xl border p-5 transition',
        isUnlocked
          ? `${tierStyle.borderUnlocked} bg-[var(--color-surface-elevated)]/90 ${tierStyle.glow}`
          : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]/60',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            'flex size-14 shrink-0 items-center justify-center rounded-2xl border',
            isUnlocked
              ? `${tierStyle.borderUnlocked} bg-[var(--color-surface)]`
              : `${tierStyle.border} bg-[var(--color-surface)]/50 opacity-45 grayscale`,
          ].join(' ')}
        >
          <Icon
            name={badge.icon}
            size={30}
            className={isUnlocked ? tierStyle.icon : 'text-[var(--color-text-muted)]'}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
            {tierLabel ? (
              <span
                className={[
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  tierStyle.border,
                  badge.tier ? tierStyle.icon : 'text-[var(--color-text-muted)]',
                ].join(' ')}
              >
                {tierLabel}
              </span>
            ) : null}
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
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
        </div>
      </div>

      {!isUnlocked && progress && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>{progressLabel}</span>
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
}

export type { AchievementTier };
