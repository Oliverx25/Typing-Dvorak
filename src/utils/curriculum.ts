import { CORE_LESSONS, getLessonById } from './lessons';

/** Lesson unlock order — first lesson is always available. Optional lessons excluded. */
export const LESSON_ORDER = CORE_LESSONS.map((l) => l.id);

const UNLOCK_ACCURACY = 90;

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

export { UNLOCK_ACCURACY };
