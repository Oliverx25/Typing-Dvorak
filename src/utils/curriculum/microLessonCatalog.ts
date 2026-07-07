import { FALLBACK_CATALOG_ROWS } from '@/data/lessonsCatalogFallback';
import {
  findCatalogRow,
  getCatalogChapters,
  isCatalogLessonId,
} from '@/utils/curriculum/catalogStore';
import { TITLE_KEY_BY_LESSON_ID } from '@/utils/curriculum/catalogTypes';

export function isMicroLessonId(lessonId: string): boolean {
  return isCatalogLessonId(lessonId);
}

export function getMicroMeta(lessonId: string) {
  const row = findCatalogRow(lessonId);
  if (!row) return undefined;
  return {
    id: row.id,
    titleKey: TITLE_KEY_BY_LESSON_ID[row.id] ?? row.id,
    chapterId: getCatalogChapters().find((ch) => ch.lessonIds.includes(row.id))?.id ?? '',
    chars: row.allowed_chars,
    difficulty: Number.parseInt(row.difficulty, 10) as 1 | 2 | 3 | 4 | 5,
  };
}

export function findGroupForMicro(microId: string) {
  const chapter = getCatalogChapters().find((ch) => ch.lessonIds.includes(microId));
  if (!chapter) return undefined;
  return {
    id: `${chapter.id}-group`,
    titleKey: chapter.titleKey,
    descriptionKey: chapter.descriptionKey,
    chapterId: chapter.id,
    microLessons: chapter.lessonIds.map((id) => getMicroMeta(id)).filter(Boolean),
  };
}

/** @deprecated Catalog is built from Supabase/fallback via catalogStore. */
export function buildMicroLessons() {
  return FALLBACK_CATALOG_ROWS;
}
