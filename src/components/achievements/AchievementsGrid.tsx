import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import AchievementCard from '@/components/achievements/AchievementCard';
import {
  ACHIEVEMENT_CATALOG,
  type CatalogEntry,
} from '@/utils/achievements/catalogData';
import {
  CATALOG_CATEGORIES,
  CATEGORY_LABEL_KEYS,
  TIER_LABEL_KEYS,
  type CatalogCategory,
} from '@/utils/achievements/catalogTypes';
import { evaluateAchievementProgress } from '@/utils/achievements/achievementEvaluator';
import { getLocalAchievementProgress } from '@/utils/achievements/progressStorage';
import { BADGES_UPDATED_EVENT, SESSION_COMPLETE_EVENT } from '@/utils/app/events';

export default function AchievementsGrid() {
  const { t } = useApp();
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>('velocidad');
  const [tick, setTick] = useState(0);

  const refresh = () => {
    evaluateAchievementProgress();
    setTick((n) => n + 1);
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

  void tick;
  const progressMap = getLocalAchievementProgress();

  const unlockedCount = useMemo(
    () => Object.values(progressMap).filter((row) => row.unlockedAt).length,
    [progressMap, tick],
  );

  const categoryEntries = useMemo(
    () =>
      ACHIEVEMENT_CATALOG.filter((entry) => entry.category === activeCategory).sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    [activeCategory],
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryTile label={t.achievements.unlockedCount} value={String(unlockedCount)} accent />
        <SummaryTile label={t.achievements.totalCount} value={String(ACHIEVEMENT_CATALOG.length)} />
        <SummaryTile
          label={t.achievements.completionRate}
          value={`${Math.round((unlockedCount / ACHIEVEMENT_CATALOG.length) * 100)}%`}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATALOG_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={[
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              activeCategory === category
                ? 'border-[var(--color-highlight)] bg-[var(--color-highlight)]/10 text-[var(--color-highlight)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-highlight)]/40 hover:text-[var(--color-text)]',
            ].join(' ')}
          >
            {t.achievements[CATEGORY_LABEL_KEYS[category] as keyof typeof t.achievements]}
          </button>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.achievements[CATEGORY_LABEL_KEYS[activeCategory] as keyof typeof t.achievements]}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categoryEntries.map((achievement) => (
            <AchievementCardRow
              key={achievement.id}
              achievement={achievement}
              progress={
                progressMap[String(achievement.id)] ?? {
                  achievementId: achievement.id,
                  slug: achievement.slug,
                  currentProgress: 0,
                  unlockedAt: null,
                }
              }
              tierLabel={
                t.achievements[TIER_LABEL_KEYS[achievement.tier] as keyof typeof t.achievements]
              }
              unlockedLabel={t.achievements.unlockedLabel}
              lockedLabel={t.achievements.lockedLabel}
              progressLabel={t.achievements.progressLabel}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function AchievementCardRow(props: {
  achievement: CatalogEntry;
  progress: ReturnType<typeof getLocalAchievementProgress>[string];
  tierLabel: string;
  unlockedLabel: string;
  lockedLabel: string;
  progressLabel: string;
}) {
  return (
    <AchievementCard
      achievement={props.achievement}
      userProgress={props.progress}
      tierLabel={props.tierLabel}
      unlockedLabel={props.unlockedLabel}
      lockedLabel={props.lockedLabel}
      progressLabel={props.progressLabel}
    />
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
