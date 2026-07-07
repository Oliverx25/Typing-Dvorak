import { calculateGrade } from '@/utils/grading';
import { masteryXpForSession, isMicroLessonForMastery } from '@/utils/curriculum/mastery';
import type { SessionRecord } from '@/utils/progress/storage';

/** Recompute mastery XP from stored session history (handles formula updates & backfill). */
export function accumulateMasteryXpFromSessions(sessions: SessionRecord[], lessonId: string): number {
  const isMicro = isMicroLessonForMastery(lessonId);
  let total = 0;

  for (const session of sessions) {
    if (session.lessonId !== lessonId) continue;
    total += masteryXpForSession({
      wpm: session.wpm,
      accuracy: session.accuracy,
      grade: session.grade ?? calculateGrade(session.accuracy),
      isMicroLesson: isMicro,
      mode: session.mode,
    });
  }

  return total;
}
