import { generateAdaptiveDrillText } from '@/utils/typing/adaptiveDrill';
import {
  generateDynamicLessonText,
  generateDynamicTestStream,
} from '@/utils/typing/dynamicTextGenerator';
import {
  getCatalogLessonById,
  getCatalogLessons,
  getCatalogRoadmapLessonIds,
  isCatalogLessonId,
} from '@/utils/curriculum/catalogStore';
import type { LessonCatalogMeta } from '@/utils/curriculum/catalogTypes';
import { generateTestStream } from '@/utils/typing/textGenerator';
import type { Locale } from '@/i18n';

export type LessonCategory = 'drill' | 'words' | 'sentences' | 'punctuation' | 'numbers' | 'symbols';

export interface Lesson {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: LessonCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  texts: string[];
  textsEs?: string[];
  generated?: boolean;
  charSet?: string;
  optional?: boolean;
  adaptive?: boolean;
  catalog?: LessonCatalogMeta;
  /** Display strings from Supabase when available. */
  catalogTitle?: string;
  catalogDescription?: string;
}

const ADAPTIVE_DRILL: Lesson = {
  id: 'adaptive-drill',
  titleKey: 'adaptiveDrill',
  descriptionKey: 'adaptiveDrill',
  category: 'drill',
  difficulty: 3,
  optional: true,
  adaptive: true,
  texts: ['aoeu dhtn aoeu dhtn'],
};

export function getLessons(): Lesson[] {
  return [...getCatalogLessons(), ADAPTIVE_DRILL];
}

/** @deprecated Use getLessons() for live catalog data. */
export const LESSONS: Lesson[] = getLessons();

export const MICRO_LESSONS: Lesson[] = getCatalogLessons();

export const CORE_LESSONS: Lesson[] = MICRO_LESSONS.filter((lesson) =>
  getCatalogRoadmapLessonIds().includes(lesson.id),
);

export function getLessonById(id: string): Lesson | undefined {
  if (id === 'adaptive-drill') return ADAPTIVE_DRILL;
  return getCatalogLessonById(id);
}

export function getLessonText(
  lesson: Lesson,
  pick: (texts: string[]) => string,
  generate?: (charSet: string) => string,
  locale: Locale = 'en',
): string {
  if (lesson.adaptive) {
    return generateAdaptiveDrillText() ?? pick(lesson.texts);
  }

  if (lesson.catalog) {
    return generateDynamicLessonText(lesson.catalog, { locale });
  }

  const pool = locale === 'es' && lesson.textsEs?.length ? lesson.textsEs : lesson.texts;
  if (lesson.generated && lesson.charSet && generate) {
    return generate(lesson.charSet);
  }
  return pick(pool);
}

export function getLessonTestStream(lesson: Lesson, locale: Locale = 'en'): string {
  if (lesson.catalog) {
    return generateDynamicTestStream(lesson.catalog, { locale, minLength: 200 });
  }
  if (lesson.charSet) {
    return generateTestStream(lesson.charSet, 200);
  }
  return pickRandomFromTexts(lesson.texts);
}

function pickRandomFromTexts(texts: string[]): string {
  return texts[Math.floor(Math.random() * texts.length)] ?? '';
}

export { isCatalogLessonId as isMicroLessonId };
