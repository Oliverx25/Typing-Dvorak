import type { Locale } from '@/i18n';
import type { CatalogEntry } from '@/utils/achievements/catalogTypes';
import {
  ACHIEVEMENT_ES_BY_SLUG,
  SUBCATEGORY_EN_TO_ES,
  type AchievementTranslation,
} from '@/i18n/achievementTranslationsEs';

export type { AchievementTranslation };

/** Translate achievement metadata for display. DB/catalog = English; Spanish from slug map. */
export function getAchievementText(entry: CatalogEntry, locale: Locale): AchievementTranslation {
  if (locale === 'es') {
    const translated = ACHIEVEMENT_ES_BY_SLUG[entry.slug];
    if (translated) {
      return {
        title: translated.title,
        description: translated.description,
        subcategory: translated.subcategory ?? translateSubcategory(entry.subcategory, locale),
      };
    }
  }

  return {
    title: entry.title,
    description: entry.description,
    subcategory: entry.subcategory,
  };
}

/** Translate English subcategory label from catalog to locale. */
export function translateSubcategory(subcategory: string | undefined, locale: Locale): string {
  if (!subcategory) return '';
  if (locale === 'es') return SUBCATEGORY_EN_TO_ES[subcategory] ?? subcategory;
  return subcategory;
}
