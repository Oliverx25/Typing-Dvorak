import { gradeRank } from '@/utils/grading';
import { UNLOCK_ACCURACY } from '@/utils/curriculum/constants';
import { MASTERY_TIER_THRESHOLDS } from '@/utils/curriculum/mastery';
import { ROADMAP_CHAPTERS, type RoadmapChapter } from '@/utils/curriculum/roadmapChapters';
import { isRoadmapLessonCompleted } from '@/utils/curriculum/roadmapProgress';
import { getCompletedLessonsMap, getHighestGradeForLesson, getMasteryXpForLesson } from '@/utils/progress/storage';

export interface ChapterStats {
  chapterId: string;
  completionPercentage: number;
  averageMasteryXp: number;
  masteryProgressPct: number;
  averageGrade: string | null;
  completedLessons: number;
  totalLessons: number;
  isLocked: boolean;
}

const GRADE_BY_RANK: Record<number, string> = {
  8: 'SS+',
  7: 'S+',
  6: 'SS',
  5: 'S',
  4: 'A',
  3: 'B',
  2: 'C',
  1: 'D',
  0: 'F',
};

function gradeFromAverageRank(avgRank: number): string {
  const rounded = Math.min(8, Math.max(0, Math.round(avgRank)));
  return GRADE_BY_RANK[rounded] ?? 'A';
}

function averageGradeForLessons(
  lessonIds: string[],
  completedLessons: Record<string, { bestAccuracy: number }>,
): string | null {
  const ranks: number[] = [];

  for (const lessonId of lessonIds) {
    if (!isRoadmapLessonCompleted(lessonId, completedLessons)) continue;
    const grade = getHighestGradeForLesson(lessonId);
    if (grade && gradeRank(grade) >= 0) {
      ranks.push(gradeRank(grade));
    } else {
      ranks.push(gradeRank('A'));
    }
  }

  if (ranks.length === 0) return null;
  return gradeFromAverageRank(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length);
}

export function computeChapterStats(
  chapter: RoadmapChapter,
  chapterIndex: number,
  previousChapterCompletion: number,
  completedLessons?: Record<string, { bestAccuracy: number }>,
): ChapterStats {
  const map = completedLessons ?? getCompletedLessonsMap();
  const totalLessons = chapter.lessonIds.length;
  const completedLessonsCount = chapter.lessonIds.filter((id) =>
    isRoadmapLessonCompleted(id, map),
  ).length;

  const completionPercentage =
    totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const totalXp = chapter.lessonIds.reduce((sum, id) => sum + getMasteryXpForLesson(id), 0);
  const averageMasteryXp = totalLessons > 0 ? Math.round(totalXp / totalLessons) : 0;
  const masteryProgressPct = Math.min(
    100,
    Math.round((averageMasteryXp / MASTERY_TIER_THRESHOLDS.ascended) * 100),
  );

  return {
    chapterId: chapter.id,
    completionPercentage,
    averageMasteryXp,
    masteryProgressPct,
    averageGrade: averageGradeForLessons(chapter.lessonIds, map),
    completedLessons: completedLessonsCount,
    totalLessons,
    isLocked: chapterIndex > 0 && previousChapterCompletion === 0,
  };
}

export function computeAllChapterStats(
  completedLessons?: Record<string, { bestAccuracy: number }>,
): Record<string, ChapterStats> {
  const map = completedLessons ?? getCompletedLessonsMap();
  const stats: Record<string, ChapterStats> = {};
  let previousCompletion = 100;

  for (let index = 0; index < ROADMAP_CHAPTERS.length; index++) {
    const chapter = ROADMAP_CHAPTERS[index];
    const chapterStats = computeChapterStats(chapter, index, previousCompletion, map);
    stats[chapter.id] = chapterStats;
    previousCompletion = chapterStats.completionPercentage;
  }

  return stats;
}

/** Chapter containing the recommended lesson, or the first chapter. */
export function getChapterIdForLesson(lessonId: string): string {
  return ROADMAP_CHAPTERS.find((chapter) => chapter.lessonIds.includes(lessonId))?.id
    ?? ROADMAP_CHAPTERS[0].id;
}

export { UNLOCK_ACCURACY };
