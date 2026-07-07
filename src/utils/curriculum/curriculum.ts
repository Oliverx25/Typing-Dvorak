import { getLessonById } from '@/utils/curriculum/lessons';
import { UNLOCK_ACCURACY } from '@/utils/curriculum/constants';
import { ROADMAP_LESSON_IDS } from '@/utils/curriculum/roadmapChapters';
import { isMicroLessonId } from '@/utils/curriculum/microLessonCatalog';

/** Sequential unlock order for the 26-lesson ergonomic curriculum. */
export const LESSON_ORDER = ROADMAP_LESSON_IDS;

export { UNLOCK_ACCURACY };

export function getLessonIndex(lessonId: string): number {
  return LESSON_ORDER.indexOf(lessonId);
}

export function getPreviousLessonId(lessonId: string): string | null {
  const idx = getLessonIndex(lessonId);
  if (idx <= 0) return null;
  return LESSON_ORDER[idx - 1];
}

export function isLessonUnlocked(
  lessonId: string,
  completedLessons: Record<string, { bestAccuracy: number }>,
): boolean {
  const lesson = getLessonById(lessonId);
  if (lesson?.optional) return true;
  if (!isMicroLessonId(lessonId) && getLessonIndex(lessonId) < 0) return false;

  const idx = getLessonIndex(lessonId);
  if (idx <= 0) return true;

  const prevId = LESSON_ORDER[idx - 1];
  const prev = completedLessons[prevId];
  return prev !== undefined && prev.bestAccuracy >= UNLOCK_ACCURACY;
}

export function getRecommendedLessonId(
  completedLessons: Record<string, { bestAccuracy: number }>,
): string {
  for (const id of LESSON_ORDER) {
    if (!completedLessons[id] || completedLessons[id].bestAccuracy < UNLOCK_ACCURACY) {
      if (isLessonUnlocked(id, completedLessons)) return id;
    }
  }
  return LESSON_ORDER[LESSON_ORDER.length - 1];
}

export function getCurriculumProgress(
  completedLessons: Record<string, { bestAccuracy: number }>,
): number {
  const mastered = LESSON_ORDER.filter(
    (id) => completedLessons[id]?.bestAccuracy >= UNLOCK_ACCURACY,
  ).length;
  return Math.round((mastered / LESSON_ORDER.length) * 100);
}
