import { CORE_LESSONS, getLessonById } from './lessons';
import { UNLOCK_ACCURACY } from './constants';
import {
  findGroupForMicro,
  getMicroMeta,
  isMicroLessonId,
} from './microLessonCatalog';

/** Lesson unlock order — first lesson is always available. Optional lessons excluded. */
export const LESSON_ORDER = CORE_LESSONS.map((l) => l.id);

export { UNLOCK_ACCURACY };

export function getLessonIndex(lessonId: string): number {
  return LESSON_ORDER.indexOf(lessonId);
}

export function getPreviousLessonId(lessonId: string): string | null {
  const idx = getLessonIndex(lessonId);
  if (idx <= 0) return null;
  return LESSON_ORDER[idx - 1];
}

function isCoreLessonUnlocked(
  lessonId: string,
  completedLessons: Record<string, { bestAccuracy: number }>,
): boolean {
  const lesson = getLessonById(lessonId);
  if (lesson?.optional) return true;

  const idx = getLessonIndex(lessonId);
  if (idx <= 0) return true;
  const prevId = LESSON_ORDER[idx - 1];
  const prev = completedLessons[prevId];
  return prev !== undefined && prev.bestAccuracy >= UNLOCK_ACCURACY;
}

export function isMicroLessonUnlocked(
  microId: string,
  completedLessons: Record<string, { bestAccuracy: number }>,
): boolean {
  const meta = getMicroMeta(microId);
  if (!meta) return false;

  if (!isCoreLessonUnlocked(meta.parentLessonId, completedLessons)) return false;

  const group = findGroupForMicro(microId);
  if (!group) return true;

  const index = group.microLessons.findIndex((micro) => micro.id === microId);
  if (index <= 0) return true;

  const previousId = group.microLessons[index - 1].id;
  const previous = completedLessons[previousId];
  return previous !== undefined && previous.bestAccuracy >= UNLOCK_ACCURACY;
}

export function isLessonUnlocked(
  lessonId: string,
  completedLessons: Record<string, { bestAccuracy: number }>,
): boolean {
  if (isMicroLessonId(lessonId)) {
    return isMicroLessonUnlocked(lessonId, completedLessons);
  }
  return isCoreLessonUnlocked(lessonId, completedLessons);
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
