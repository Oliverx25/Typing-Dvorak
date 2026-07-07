/** Roadmap chapter taxonomy — derived from lessons_catalog (Supabase) or fallback seed. */

import {
  getCatalogChapters,
  getCatalogRoadmapLessonIds,
  getCatalogLessonById as getChapterLessonById,
} from '@/utils/curriculum/catalogStore';
import type { RoadmapChapter } from '@/utils/curriculum/catalogTypes';
import { FALLBACK_CATALOG_ROWS } from '@/data/lessonsCatalogFallback';
import { buildChaptersFromRows } from '@/utils/curriculum/catalogStore';

export type { RoadmapChapter };

const FALLBACK_CHAPTERS = buildChaptersFromRows(FALLBACK_CATALOG_ROWS);
const FALLBACK_LESSON_IDS = FALLBACK_CHAPTERS.flatMap((chapter) => chapter.lessonIds);

export function getRoadmapChapters(): RoadmapChapter[] {
  const chapters = getCatalogChapters();
  return chapters.length > 0 ? chapters : FALLBACK_CHAPTERS;
}

export function getRoadmapLessonIds(): string[] {
  const ids = getCatalogRoadmapLessonIds();
  return ids.length > 0 ? ids : FALLBACK_LESSON_IDS;
}

/** @deprecated Prefer getRoadmapChapters() — static snapshot for SSR/tests. */
export const ROADMAP_CHAPTERS: RoadmapChapter[] = FALLBACK_CHAPTERS;

/** @deprecated Prefer getRoadmapLessonIds(). */
export const ROADMAP_LESSON_IDS: string[] = FALLBACK_LESSON_IDS;

export function getRoadmapChapter(chapterId: string): RoadmapChapter | undefined {
  return getRoadmapChapters().find((chapter) => chapter.id === chapterId);
}

export function getChapterForLesson(lessonId: string): RoadmapChapter | undefined {
  return getRoadmapChapters().find((chapter) => chapter.lessonIds.includes(lessonId));
}

export function getChapterIdForLesson(lessonId: string): string | undefined {
  return getChapterForLesson(lessonId)?.id;
}

export { getChapterLessonById as getLessonById };
