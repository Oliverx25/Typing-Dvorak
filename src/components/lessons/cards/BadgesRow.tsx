import { useMemo } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { BADGES } from '@/utils/achievements/badges';
import { useAppStore } from '@/store/useAppStore';
import { Icon } from '@/components/ui';

export default function BadgesRow() {
  const { t } = useApp();
  const userAchievements = useAppStore((state) => state.userAchievements);

  const unlocked = useMemo(
    () =>
      Object.values(userAchievements)
        .filter((row) => row.unlockedAt)
        .map((row) => row.slug),
    [userAchievements],
  );

  if (unlocked.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {t.home.badgesTitle}
      </h2>
      <div className="flex flex-wrap gap-2">
        {BADGES.filter((b) => unlocked.includes(b.id)).map((badge) => (
          <div
            key={badge.id}
            title={t.badges[badge.descKey as keyof typeof t.badges]}
            className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5"
          >
            <Icon name={badge.icon} size={18} className="text-[var(--color-highlight)]" />
            <span className="text-xs font-medium text-[var(--color-text)]">
              {t.badges[badge.titleKey as keyof typeof t.badges]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
