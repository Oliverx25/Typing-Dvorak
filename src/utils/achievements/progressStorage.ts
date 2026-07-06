import { STORAGE_KEYS } from '@/utils/progress/keys';
import { readJson, writeJson } from '@/utils/progress/localStorage';
import { CATALOG_BY_ID } from '@/utils/achievements/catalogData';
import type { UserAchievementProgress } from '@/utils/achievements/catalogTypes';

type ProgressMap = Record<string, UserAchievementProgress>;

function emptyProgressMap(): ProgressMap {
  return {};
}

export function getLocalAchievementProgress(): ProgressMap {
  return readJson(STORAGE_KEYS.achievementProgress, emptyProgressMap());
}

export function saveLocalAchievementProgress(map: ProgressMap): void {
  writeJson(STORAGE_KEYS.achievementProgress, map);
}

export function getProgressForAchievement(achievementId: number): UserAchievementProgress {
  const catalog = CATALOG_BY_ID.get(achievementId);
  const slug = catalog?.slug ?? String(achievementId);
  const stored = getLocalAchievementProgress()[String(achievementId)];
  return (
    stored ?? {
      achievementId,
      slug,
      currentProgress: 0,
      unlockedAt: null,
    }
  );
}

export function replaceLocalAchievementProgress(rows: UserAchievementProgress[]): void {
  const map: ProgressMap = {};
  for (const row of rows) {
    map[String(row.achievementId)] = row;
  }
  saveLocalAchievementProgress(map);
}

export function isAchievementUnlocked(achievementId: number): boolean {
  return getProgressForAchievement(achievementId).unlockedAt != null;
}

/** @deprecated Bridge for legacy badge id checks — uses slug overlap where possible. */
export function getUnlockedAchievementSlugs(): string[] {
  return Object.values(getLocalAchievementProgress())
    .filter((row) => row.unlockedAt)
    .map((row) => row.slug);
}
