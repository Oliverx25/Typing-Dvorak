import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  evaluateAchievementProgress,
  type LastSessionSnapshot,
} from '@/utils/achievements/achievementEvaluator';
import {
  getLocalAchievementProgress,
  mergeLocalAchievementProgress,
} from '@/utils/achievements/progressStorage';
import type { UserAchievementProgress } from '@/utils/achievements/catalogTypes';
import { fetchUserAchievements } from '@/services/supabase/queries';

async function persistUserAchievements(
  userId: string,
  rows: UserAchievementProgress[],
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  for (const row of rows) {
    const { error } = await supabase.from('user_achievements').upsert(
      {
        user_id: userId,
        achievement_id: row.achievementId,
        current_progress: row.currentProgress,
        unlocked_at: row.unlockedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,achievement_id' },
    );
    if (error) console.warn('[sync] user_achievements upsert failed:', error.message);
  }
}

async function fetchCloudAchievementProgress(userId: string): Promise<UserAchievementProgress[]> {
  return fetchUserAchievements(userId);
}

/** Recompute local progress and mirror to Supabase user_achievements. */
export async function syncAchievementsToCloud(
  userId: string,
  lastSession?: LastSessionSnapshot,
): Promise<string[]> {
  evaluateAchievementProgress(lastSession);
  const rows = Object.values(getLocalAchievementProgress());
  await persistUserAchievements(userId, rows);
  return rows.filter((row) => row.unlockedAt).map((row) => row.slug);
}

/** Load cloud progress, merge locally, and re-evaluate. */
export async function syncAchievementsFromCloud(userId: string): Promise<string[]> {
  const cloudRows = await fetchCloudAchievementProgress(userId);
  if (cloudRows.length > 0) {
    mergeLocalAchievementProgress(cloudRows);
  }
  evaluateAchievementProgress();
  const rows = Object.values(getLocalAchievementProgress());
  await persistUserAchievements(userId, rows);
  return rows.filter((row) => row.unlockedAt).map((row) => row.slug);
}

/** @deprecated Use syncAchievementsToCloud */
export async function syncBadgesToCloud(userId: string): Promise<string[]> {
  return syncAchievementsToCloud(userId);
}

/** @deprecated Use syncAchievementsFromCloud */
export async function syncBadgesFromSessionRows(
  userId: string,
  _sessions: unknown[],
  _streak: number,
): Promise<string[]> {
  void _sessions;
  void _streak;
  return syncAchievementsFromCloud(userId);
}
