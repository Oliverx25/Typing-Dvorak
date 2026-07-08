import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { translateSubcategory } from '@/i18n/achievements';
import {
  ACHIEVEMENT_CATALOG,
  type CatalogEntry,
} from '@/utils/achievements/catalogData';
import {
  CATALOG_CATEGORIES,
  CATEGORY_LABEL_KEYS,
  TIER_LABEL_KEYS,
  type CatalogCategory,
  type UserAchievementProgress,
} from '@/utils/achievements/catalogTypes';
import { getLocalAchievementProgress } from '@/utils/achievements/progressStorage';
import { BADGES_UPDATED_EVENT, SESSION_COMPLETE_EVENT } from '@/utils/app/events';

const AchievementCard = lazy(() => import('@/components/achievements/AchievementCard'));

export default function AchievementsGrid() {
  const { t, locale } = useApp();
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>('velocidad');
  const [progressMap, setProgressMap] = useState<Record<string, UserAchievementProgress>>({});

  const refresh = useCallback(() => {
    setProgressMap(getLocalAchievementProgress());
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, handler);
    window.addEventListener(BADGES_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(SESSION_COMPLETE_EVENT, handler);
      window.removeEventListener(BADGES_UPDATED_EVENT, handler);
    };
  }, [refresh]);

  const unlockedCount = useMemo(
    () => Object.values(progressMap).filter((row) => row.unlockedAt).length,
    [progressMap],
  );

  const handleCategoryChange = useCallback((category: CatalogCategory) => {
    setActiveCategory(category);
  }, []);

  const categoryEntries = useMemo(
    () =>
      ACHIEVEMENT_CATALOG.filter((entry) => entry.category === activeCategory).sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    [activeCategory],
  );

  const groupedBySubcategory = useMemo(() => {
    const groups: Record<string, CatalogEntry[]> = {};
    for (const entry of categoryEntries) {
      const key = entry.subcategory?.trim() || 'General';
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return groups;
  }, [categoryEntries]);

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
            onClick={() => handleCategoryChange(category)}
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
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.achievements[CATEGORY_LABEL_KEYS[activeCategory] as keyof typeof t.achievements]}
        </h2>

        {Object.entries(groupedBySubcategory).map(([subcategory, achievements]) => (
          <div key={subcategory} className="mb-10 w-full">
            <div className="mb-4 flex items-center gap-4">
              <h3 className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {translateSubcategory(subcategory, locale)}
              </h3>
              <div className="h-px flex-grow bg-slate-800/50" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {achievements.map((achievement) => (
                <Suspense
                  key={achievement.id}
                  fallback={
                    <div className="h-48 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]" />
                  }
                >
                  <AchievementCardRow
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
                </Suspense>
              ))}
            </div>
          </div>
        ))}
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
