import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { BADGES, getUnlockedBadges } from '@/utils/badges';
import { SESSION_COMPLETE_EVENT } from '@/utils/events';
import { BadgeIcon } from '@/components/ui';

export default function BadgesRow() {
  const { t } = useApp();
  const [unlocked, setUnlocked] = useState<string[]>([]);

  const refresh = () => setUnlocked(getUnlockedBadges());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, handler);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, handler);
  }, []);

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
            <BadgeIcon src={badge.icon} size={18} />
            <span className="text-xs font-medium text-[var(--color-text)]">
              {t.badges[badge.titleKey as keyof typeof t.badges]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
