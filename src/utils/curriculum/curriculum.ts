import { getLessonById } from '@/utils/curriculum/lessons';
import { UNLOCK_ACCURACY } from '@/utils/curriculum/constants';
import { getRoadmapLessonIds } from '@/utils/curriculum/roadmapChapters';
import { isMicroLessonId } from '@/utils/curriculum/microLessonCatalog';

/** Sequential unlock order for the ergonomic curriculum. */
export function getLessonOrder(): string[] {
  return getRoadmapLessonIds();
}

export const LESSON_ORDER = getRoadmapLessonIds();

export { UNLOCK_ACCURACY };

export function getLessonIndex(lessonId: string): number {
  return getRoadmapLessonIds().indexOf(lessonId);
}

export function getPreviousLessonId(lessonId: string): string | null {
  const order = getRoadmapLessonIds();
  const idx = order.indexOf(lessonId);
  if (idx <= 0) return null;
  return order[idx - 1];
}

export function isLessonUnlocked(
  lessonId: string,
  completedLessons: Record<string, { bestAccuracy: number }>,
): boolean {
  const lesson = getLessonById(lessonId);
  if (lesson?.optional) return true;
  if (!isMicroLessonId(lessonId) && getLessonIndex(lessonId) < 0) return false;

  const order = getRoadmapLessonIds();
  const idx = getLessonIndex(lessonId);
  if (idx <= 0) return true;

  const prevId = order[idx - 1];
  const prev = completedLessons[prevId];
  return prev !== undefined && prev.bestAccuracy >= UNLOCK_ACCURACY;
}

export function getRecommendedLessonId(
  completedLessons: Record<string, { bestAccuracy: number }>,
): string {
  const order = getRoadmapLessonIds();
  for (const id of order) {
    if (!completedLessons[id] || completedLessons[id].bestAccuracy < UNLOCK_ACCURACY) {
      if (isLessonUnlocked(id, completedLessons)) return id;
    }
  }
  return order[order.length - 1];
}

export function getCurriculumProgress(
  completedLessons: Record<string, { bestAccuracy: number }>,
): number {
  const order = getRoadmapLessonIds();
  const mastered = order.filter(
    (id) => completedLessons[id]?.bestAccuracy >= UNLOCK_ACCURACY,
  ).length;
  return Math.round((mastered / order.length) * 100);
}
