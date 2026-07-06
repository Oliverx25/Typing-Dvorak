import { dispatchAchievementsUnlocked } from '../app/events';
import { CATALOG_BY_SLUG } from './catalogData';
import type { CatalogCategory, CatalogTier } from './catalogTypes';

export interface AchievementToastItem {
  slug: string;
  title: string;
  tier: CatalogTier;
  category: CatalogCategory;
}

export function buildAchievementToastItems(slugs: string[]): AchievementToastItem[] {
  return slugs
    .map((slug) => {
      const entry = CATALOG_BY_SLUG.get(slug);
      if (!entry) return null;
      return {
        slug: entry.slug,
        title: entry.title,
        tier: entry.tier,
        category: entry.category,
      };
    })
    .filter((item): item is AchievementToastItem => item != null);
}

/** Show achievement unlock toasts (call only after lesson/race completion). */
export function notifyAchievementUnlocks(slugs: string[]): void {
  const items = buildAchievementToastItems(slugs);
  if (items.length === 0) return;
  dispatchAchievementsUnlocked(items);
}
