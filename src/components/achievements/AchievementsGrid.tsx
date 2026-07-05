import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import AchievementCard from '@/components/achievements/AchievementCard';
import {
  ACHIEVEMENT_FAMILIES,
  FAMILY_TITLE_KEYS,
  getAchievementsByFamily,
} from '@/utils/achievements/achievements.config';
import {
  BADGES,
  buildBadgeEvaluationFromLocal,
  getBadgeProgressState,
  getUnlockedBadges,
} from '@/utils/achievements/badges';
import { TIER_STYLES } from '@/utils/achievements/tierStyles';
import { BADGES_UPDATED_EVENT, SESSION_COMPLETE_EVENT } from '@/utils/app/events';

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

      <div className="space-y-10">
        {ACHIEVEMENT_FAMILIES.map((family, index) => {
          const familyBadges = getAchievementsByFamily(family).map((definition) =>
            BADGES.find((badge) => badge.id === definition.id)!,
          );

          return (
            <section key={family}>
              {index > 0 ? <hr className="mb-10 border-[var(--color-border)]" /> : null}
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {t.achievements[FAMILY_TITLE_KEYS[family] as keyof typeof t.achievements]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {familyBadges.map((badge) => {
                  const isUnlocked = unlocked.includes(badge.id);
                  const progress = getBadgeProgressState(badge.id, evaluation);
                  const title = t.badges[badge.titleKey as keyof typeof t.badges];
                  const description = t.badges[badge.descKey as keyof typeof t.badges];
                  const tierLabel = badge.tier
                    ? t.achievements[TIER_STYLES[badge.tier].labelKey]
                    : undefined;

                  return (
                    <AchievementCard
                      key={badge.id}
                      badge={badge}
                      title={title}
                      description={description}
                      isUnlocked={isUnlocked}
                      progress={progress}
                      unlockedLabel={t.achievements.unlockedLabel}
                      lockedLabel={t.achievements.lockedLabel}
                      progressLabel={t.achievements.progressLabel}
                      tierLabel={tierLabel}
                    />
                  );
                })}
              </div>
            </section>
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
