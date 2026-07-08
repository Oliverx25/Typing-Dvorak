import type { UserAchievementProgress } from '@/utils/achievements/catalogTypes';

/** Compact representation of a row's synced state (progress + unlock instant). */
export function achievementFingerprint(row: UserAchievementProgress): string {
  return `${row.currentProgress}|${row.unlockedAt ?? ''}`;
}

/**
 * Validates a session delta before writing to Supabase.
 * Rejects rows that regress progress or unlock without meeting the target.
 */
export function validateAchievementDelta(
  baseline: Record<string, UserAchievementProgress>,
  delta: UserAchievementProgress[],
  catalogTargets: Map<number, number>,
): UserAchievementProgress[] {
  return delta.filter((row) => {
    const target = catalogTargets.get(row.achievementId) ?? row.currentProgress;
    const previous = baseline[String(row.achievementId)];
    const previousProgress = previous?.currentProgress ?? 0;

    if (row.currentProgress < previousProgress) return false;
    if (row.currentProgress > target) return false;
    if (row.unlockedAt && row.currentProgress < target) return false;
    if (!row.unlockedAt && previous?.unlockedAt) return false;

    return row.currentProgress > previousProgress || (!previous?.unlockedAt && row.unlockedAt != null);
  });
}
