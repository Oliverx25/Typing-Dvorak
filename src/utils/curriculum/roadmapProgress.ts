import { gradeRank } from '@/utils/grading';
import { UNLOCK_ACCURACY } from '@/utils/curriculum/constants';
import { getRoadmapChapters, getRoadmapLessonIds } from '@/utils/curriculum/roadmapChapters';
import { getCompletedLessonsMap } from '@/utils/progress/storage';
import { getHighestGradeForLesson } from '@/utils/progress/storage';

export interface RoadmapProgressSnapshot {
  globalProgress: number;
  chapterProgress: Record<string, number>;
  completedCount: number;
  totalCount: number;
  isRoadmapComplete: boolean;
}

/** A roadmap lesson is complete with grade A+ or ≥90% accuracy. */
export function isRoadmapLessonCompleted(
  lessonId: string,
  completedLessons?: Record<string, { bestAccuracy: number }>,
): boolean {
  const map = completedLessons ?? getCompletedLessonsMap();
  const accuracy = map[lessonId]?.bestAccuracy ?? 0;
  if (accuracy >= UNLOCK_ACCURACY) return true;

  const grade = getHighestGradeForLesson(lessonId);
  return grade != null && gradeRank(grade) >= gradeRank('A');
}

export function computeChapterProgress(
  chapterId: string,
  completedLessons?: Record<string, { bestAccuracy: number }>,
): number {
  const chapter = getRoadmapChapters().find((c) => c.id === chapterId);
  if (!chapter || chapter.lessonIds.length === 0) return 0;

  const map = completedLessons ?? getCompletedLessonsMap();
  const done = chapter.lessonIds.filter((id) => isRoadmapLessonCompleted(id, map)).length;
  return Math.round((done / chapter.lessonIds.length) * 100);
}

export function computeGlobalRoadmapProgress(
  completedLessons?: Record<string, { bestAccuracy: number }>,
): number {
  const map = completedLessons ?? getCompletedLessonsMap();
  const lessonIds = getRoadmapLessonIds();
  const done = lessonIds.filter((id) => isRoadmapLessonCompleted(id, map)).length;
  return Math.round((done / lessonIds.length) * 100);
}

export function computeRoadmapProgress(
  completedLessons?: Record<string, { bestAccuracy: number }>,
): RoadmapProgressSnapshot {
  const map = completedLessons ?? getCompletedLessonsMap();
  const lessonIds = getRoadmapLessonIds();
  const completedCount = lessonIds.filter((id) => isRoadmapLessonCompleted(id, map)).length;
  const globalProgress = Math.round((completedCount / lessonIds.length) * 100);

  const chapterProgress: Record<string, number> = {};
  for (const chapter of getRoadmapChapters()) {
    chapterProgress[chapter.id] = computeChapterProgress(chapter.id, map);
  }

  return {
    globalProgress,
    chapterProgress,
    completedCount,
    totalCount: lessonIds.length,
    isRoadmapComplete: globalProgress >= 100,
  };
}
