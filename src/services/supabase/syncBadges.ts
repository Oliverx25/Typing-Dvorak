import { getSupabaseClient } from '../../lib/supabaseClient';
import { ACHIEVEMENT_CATALOG } from '../../utils/achievements/catalogData';
import {
  evaluateAchievementProgress,
  type LastSessionSnapshot,
} from '../../utils/achievements/achievementEvaluator';
import {
  getLocalAchievementProgress,
  replaceLocalAchievementProgress,
} from '../../utils/achievements/progressStorage';
import type { UserAchievementProgress } from '../../utils/achievements/catalogTypes';

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
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id, current_progress, unlocked_at')
    .eq('user_id', userId);

  if (error) {
    console.warn('[sync] user_achievements fetch failed:', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const achievementId = row.achievement_id as number;
    const catalog = ACHIEVEMENT_CATALOG.find((item) => item.id === achievementId);
    return {
      achievementId,
      slug: catalog?.slug ?? String(achievementId),
      currentProgress: row.current_progress as number,
      unlockedAt: (row.unlocked_at as string | null) ?? null,
    };
  });
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
    replaceLocalAchievementProgress(cloudRows);
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
