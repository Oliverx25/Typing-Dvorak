import { getCompletedLessonsMap, getProgress, getSessionHistory } from '@/utils/progress/storage';
import { LESSON_ORDER } from '@/utils/curriculum/curriculum';
import { UNLOCK_ACCURACY } from '@/utils/curriculum/constants';
import {
  countMasteredLessons,
  MASTER_ACCURACY,
  type UserAchievementStats,
} from '@/utils/achievements/achievements.config';
import { getMultiplayerStats } from '@/utils/achievements/multiplayerStats';

export interface SessionSummaryForStats {
  lesson_id: string;
  wpm: number;
  accuracy: number;
  max_combo?: number;
  created_at?: string;
}

function buildLessonBestsFromLocal(): Record<string, { bestAccuracy: number; bestWpm: number }> {
  return getCompletedLessonsMap();
}

/** Build aggregated stats from local session history and progress. */
export function buildUserAchievementStatsFromLocal(): UserAchievementStats {
  const history = getSessionHistory();
  const progress = getProgress();
  const mp = getMultiplayerStats();
  const lessonBests = buildLessonBestsFromLocal();

  let totalPerfectSessions = 0;
  let highestWpmEver = 0;
  let highestComboEver = 0;

  for (const session of history) {
    if (session.accuracy === 100) totalPerfectSessions += 1;
    highestWpmEver = Math.max(highestWpmEver, session.wpm);
    highestComboEver = Math.max(highestComboEver, session.maxCombo ?? 0);
  }

  return {
    totalSessionsPlayed: history.length,
    totalPerfectSessions,
    highestWpmEver,
    highestComboEver,
    currentDayStreak: progress.streak,
    totalMultiplayerMatches: mp.matches,
    totalMultiplayerWins: mp.wins,
    masteredLessonCount: countMasteredLessons(lessonBests, UNLOCK_ACCURACY),
    masterLessonCount: countMasteredLessons(lessonBests, MASTER_ACCURACY),
    totalCurriculumLessons: LESSON_ORDER.length,
    sessionTimestamps: history.map((s) => s.completedAt),
  };
}

/** Build aggregated stats from cloud session rows. */
export function buildUserAchievementStatsFromSessions(
  sessions: SessionSummaryForStats[],
  streak: number,
  mpStats?: { matches: number; wins: number },
): UserAchievementStats {
  const lessonBests: Record<string, { bestAccuracy: number; bestWpm: number }> = {};
  let totalPerfectSessions = 0;
  let highestWpmEver = 0;
  let highestComboEver = 0;
  const timestamps: string[] = [];

  for (const session of sessions) {
    const accuracy = Number(session.accuracy);
    if (accuracy === 100) totalPerfectSessions += 1;
    highestWpmEver = Math.max(highestWpmEver, session.wpm);
    highestComboEver = Math.max(highestComboEver, session.max_combo ?? 0);
    if (session.created_at) timestamps.push(session.created_at);

    const existing = lessonBests[session.lesson_id];
    lessonBests[session.lesson_id] = {
      bestWpm: Math.max(existing?.bestWpm ?? 0, session.wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
    };
  }

  const mp = mpStats ?? getMultiplayerStats();

  return {
    totalSessionsPlayed: sessions.length,
    totalPerfectSessions,
    highestWpmEver,
    highestComboEver,
    currentDayStreak: streak,
    totalMultiplayerMatches: mp.matches,
    totalMultiplayerWins: mp.wins,
    masteredLessonCount: countMasteredLessons(lessonBests, UNLOCK_ACCURACY),
    masterLessonCount: countMasteredLessons(lessonBests, MASTER_ACCURACY),
    totalCurriculumLessons: LESSON_ORDER.length,
    sessionTimestamps: timestamps,
  };
}
