import { getSupabaseClient } from '../../lib/supabaseClient';
import {
  evaluateUnlockedBadges,
  replaceUnlockedBadges,
  type BadgeEvaluationInput,
} from '../../utils/achievements/badges';
import { LESSON_ORDER } from '../../utils/curriculum/curriculum';
import { UNLOCK_ACCURACY } from '../../utils/curriculum/constants';
import { collectPracticeDates, computeStreakFromPracticeDates } from '../../utils/progress/streak';
import { fetchAllUserSessionSummaries, fetchUserSessionTimestamps } from './queries';

export interface SessionSummary {
  lesson_id: string;
  wpm: number;
  accuracy: number;
}

export function buildBadgeEvaluationFromSessions(
  sessions: SessionSummary[],
  streak: number,
): BadgeEvaluationInput {
  const lessonBests: Record<string, { bestAccuracy: number; bestWpm: number }> = {};
  let bestWpm = 0;
  let hasPerfectRun = false;

  for (const session of sessions) {
    const accuracy = Number(session.accuracy);
    bestWpm = Math.max(bestWpm, session.wpm);
    if (accuracy === 100) hasPerfectRun = true;

    const existing = lessonBests[session.lesson_id];
    lessonBests[session.lesson_id] = {
      bestWpm: Math.max(existing?.bestWpm ?? 0, session.wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
    };
  }

  const masteredLessonCount = LESSON_ORDER.filter(
    (id) => (lessonBests[id]?.bestAccuracy ?? 0) >= UNLOCK_ACCURACY,
  ).length;

  return {
    completedLessonCount: Object.keys(lessonBests).length,
    streak,
    bestWpm,
    hasPerfectRun,
    masteredLessonCount,
    totalCurriculumLessons: LESSON_ORDER.length,
  };
}

async function persistUserBadges(userId: string, badgeIds: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  for (const badgeId of badgeIds) {
    const { error } = await supabase.from('user_badges').upsert(
      { user_id: userId, badge_id: badgeId },
      { onConflict: 'user_id,badge_id' },
    );
    if (error) console.warn('[sync] user_badges upsert failed:', error.message);
  }
}

/** Recompute badges from all cloud sessions, persist, and mirror to localStorage. */
export async function syncBadgesToCloud(userId: string): Promise<string[]> {
  const [sessions, timestamps] = await Promise.all([
    fetchAllUserSessionSummaries(),
    fetchUserSessionTimestamps(),
  ]);

  const streak = computeStreakFromPracticeDates(collectPracticeDates(timestamps)).streak;
  const unlocked = evaluateUnlockedBadges(buildBadgeEvaluationFromSessions(sessions, streak));

  await persistUserBadges(userId, unlocked);
  replaceUnlockedBadges(unlocked);

  return unlocked;
}

/** Recompute from already-fetched session rows (login load). */
export async function syncBadgesFromSessionRows(
  userId: string,
  sessions: SessionSummary[],
  streak: number,
): Promise<string[]> {
  const unlocked = evaluateUnlockedBadges(buildBadgeEvaluationFromSessions(sessions, streak));
  await persistUserBadges(userId, unlocked);
  replaceUnlockedBadges(unlocked);
  return unlocked;
}
