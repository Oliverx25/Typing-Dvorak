import { CURRICULUM_LESSONS } from '@/data/microLessons';
import type { GenerationType, LessonsCatalogRow } from '@/utils/curriculum/catalogTypes';

const STATIC_VARIANT_SEPARATOR = '\n---\n';

function inferGenerationType(id: string, hasTexts: boolean): GenerationType {
  if (hasTexts) return 'static';
  if (
    id === 'alphabet_mastery' ||
    id === 'base_alternation' ||
    id === 'base_top_integration' ||
    id === 'bilingual_flow' ||
    id === 'es_accents' ||
    id === 'advanced_prose'
  ) {
    return 'dictionary_words';
  }
  return 'random_chars';
}

function chapterNumber(chapterId: string): number {
  const map: Record<string, number> = {
    ch1_fundamentals: 1,
    ch2_top_expansion: 2,
    ch3_bottom_reach: 3,
    ch4_bilingual: 4,
    ch5_mechanics: 5,
    ch6_development: 6,
    ch7_fire_test: 7,
  };
  return map[chapterId] ?? 1;
}

/** Offline fallback — mirrors supabase/migrations/add_lessons_catalog.sql seed data. */
export function buildFallbackCatalogRows(): LessonsCatalogRow[] {
  const orderByChapter = new Map<string, number>();

  return CURRICULUM_LESSONS.map((micro) => {
    const chapter_id = chapterNumber(micro.chapterId);
    const order = (orderByChapter.get(micro.chapterId) ?? 0) + 1;
    orderByChapter.set(micro.chapterId, order);

    const hasTexts = Boolean(micro.texts?.length);
    const generation_type = inferGenerationType(micro.id, hasTexts);

    return {
      id: micro.id,
      chapter_id,
      title: micro.id,
      description: micro.id,
      difficulty: String(micro.difficulty),
      generation_type,
      allowed_chars: hasTexts ? 'abcdefghijklmnopqrstuvwxyz' : micro.chars,
      static_text: hasTexts ? micro.texts!.join(STATIC_VARIANT_SEPARATOR) : null,
      order_index: order,
    };
  });
}

export const FALLBACK_CATALOG_ROWS: LessonsCatalogRow[] = buildFallbackCatalogRows();
