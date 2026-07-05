import { getSupabaseClient } from '../../lib/supabaseClient';
import {
  evaluateUnlockedBadges,
  replaceUnlockedBadges,
} from '../../utils/achievements/badges';
import {
  buildUserAchievementStatsFromSessions,
  type SessionSummaryForStats,
} from '../../utils/achievements/userStats';
import { collectPracticeDates, computeStreakFromPracticeDates } from '../../utils/progress/streak';
import { fetchAllUserSessionSummaries, fetchUserSessionTimestamps } from './queries';

export type SessionSummary = SessionSummaryForStats;

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

async function fetchCloudMultiplayerStats(userId: string): Promise<{ matches: number; wins: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { matches: 0, wins: 0 };

  const { count: matches, error: matchError } = await supabase
    .from('race_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (matchError) {
    console.warn('[sync] race_results count failed:', matchError.message);
    return { matches: 0, wins: 0 };
  }

  const { count: wins, error: winError } = await supabase
    .from('race_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('placement', 1);

  if (winError) {
    console.warn('[sync] race_results wins count failed:', winError.message);
    return { matches: matches ?? 0, wins: 0 };
  }

  return { matches: matches ?? 0, wins: wins ?? 0 };
}

/** Recompute badges from all cloud sessions, persist, and mirror to localStorage. */
export async function syncBadgesToCloud(userId: string): Promise<string[]> {
  const [sessions, timestamps, mpStats] = await Promise.all([
    fetchAllUserSessionSummaries(),
    fetchUserSessionTimestamps(),
    fetchCloudMultiplayerStats(userId),
  ]);

  const streak = computeStreakFromPracticeDates(collectPracticeDates(timestamps)).streak;
  const stats = buildUserAchievementStatsFromSessions(sessions, streak, mpStats);
  const unlocked = evaluateUnlockedBadges(stats);

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
  const mpStats = await fetchCloudMultiplayerStats(userId);
  const stats = buildUserAchievementStatsFromSessions(sessions, streak, mpStats);
  const unlocked = evaluateUnlockedBadges(stats);
  await persistUserBadges(userId, unlocked);
  replaceUnlockedBadges(unlocked);
  return unlocked;
}
