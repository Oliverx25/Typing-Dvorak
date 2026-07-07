import { getRecommendedLessonId, getCurriculumProgress } from '@/utils/curriculum/curriculum';
import { getCompletedLessonsMap } from '@/utils/progress/storage';

/** Build unlock map from localStorage — safe on server (returns empty). */
export function buildUnlockMap(): Record<string, { bestAccuracy: number }> {
  if (typeof window === 'undefined') return {};
  const completed = getCompletedLessonsMap();
  return Object.fromEntries(
    Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
  );
}

export function readCurriculumFromStorage(): { progress: number; recommendedId: string } {
  const forUnlock = buildUnlockMap();
  return {
    progress: getCurriculumProgress(forUnlock),
    recommendedId: getRecommendedLessonId(forUnlock),
  };
}
