import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  evaluateSessionAchievementDelta,
  type LastSessionSnapshot,
} from '@/utils/achievements/achievementEvaluator';
import type { UserAchievementProgress } from '@/utils/achievements/catalogTypes';
import { fetchUserAchievements } from '@/services/supabase/queries';
import { getAppStoreState } from '@/store/useAppStore';

/** Batch upsert — a single request instead of one per achievement. */
async function persistUserAchievements(
  userId: string,
  rows: UserAchievementProgress[],
): Promise<boolean> {
  if (rows.length === 0) return true;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const updatedAt = new Date().toISOString();
  const payload = rows.map((row) => ({
    user_id: userId,
    achievement_id: row.achievementId,
    current_progress: row.currentProgress,
    unlocked_at: row.unlockedAt,
    updated_at: updatedAt,
  }));

  const { error } = await supabase
    .from('user_achievements')
    .upsert(payload, { onConflict: 'user_id,achievement_id' });

  if (error) {
    console.warn('[sync] user_achievements upsert failed:', error.message);
    return false;
  }
  return true;
}

function rowsToBaseline(rows: UserAchievementProgress[]): Record<string, UserAchievementProgress> {
  const map: Record<string, UserAchievementProgress> = {};
  for (const row of rows) {
    map[String(row.achievementId)] = row;
  }
  return map;
}

/**
 * Event-driven cloud sync: fetch trusted baseline from Supabase, compute a
 * session-isolated delta, bulk-upsert only that delta, then merge into Zustand.
 */
export async function syncAchievementsToCloud(
  userId: string,
  lastSession?: LastSessionSnapshot,
): Promise<string[]> {
  if (!lastSession) {
    return Object.values(getAppStoreState().userAchievements)
      .filter((row) => row.unlockedAt)
      .map((row) => row.slug);
  }

  const cloudRows = await fetchUserAchievements(userId);
  const serverBaseline = rowsToBaseline(cloudRows);

  const delta = evaluateSessionAchievementDelta(lastSession, serverBaseline);
  if (delta.length === 0) {
    return cloudRows.filter((row) => row.unlockedAt).map((row) => row.slug);
  }

  const ok = await persistUserAchievements(userId, delta);
  if (ok) {
    getAppStoreState().commitSyncedAchievements(delta);
  }

  const merged = { ...serverBaseline };
  for (const row of delta) {
    merged[String(row.achievementId)] = row;
  }
  return Object.values(merged)
    .filter((row) => row.unlockedAt)
    .map((row) => row.slug);
}

/** Load cloud progress into the store (read path only — no writes). */
export async function syncAchievementsFromCloud(userId: string): Promise<string[]> {
  const cloudRows = await fetchUserAchievements(userId);
  if (cloudRows.length > 0) {
    getAppStoreState().setAchievements(cloudRows);
  }
  return cloudRows.filter((row) => row.unlockedAt).map((row) => row.slug);
}

/** @deprecated Use syncAchievementsToCloud */
export async function syncBadgesToCloud(
  userId: string,
  lastSession?: LastSessionSnapshot,
): Promise<string[]> {
  return syncAchievementsToCloud(userId, lastSession);
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
