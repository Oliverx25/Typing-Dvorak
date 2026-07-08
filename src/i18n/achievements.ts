import type { Locale } from '@/i18n';
import type { CatalogEntry } from '@/utils/achievements/catalogData';

export interface AchievementText {
  title: string;
  description: string;
  subcategory?: string;
}

/**
 * Display-layer translation for achievements.
 * Catalog/DB stores English (source of truth); Spanish overrides can be added per slug.
 */
export function getAchievementText(entry: CatalogEntry, locale: Locale): AchievementText {
  void locale;
  return {
    title: entry.title,
    description: entry.description,
    subcategory: entry.subcategory,
  };
}
