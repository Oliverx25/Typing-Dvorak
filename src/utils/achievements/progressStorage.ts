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

/** Merge cloud rows with local — keeps max progress and earliest unlock timestamp. */
export function mergeLocalAchievementProgress(rows: UserAchievementProgress[]): void {
  if (rows.length === 0) return;

  const map = getLocalAchievementProgress();

  for (const row of rows) {
    const key = String(row.achievementId);
    const existing = map[key];
    const catalog = CATALOG_BY_ID.get(row.achievementId);
    const target = catalog?.targetValue ?? row.currentProgress;

    if (!existing) {
      map[key] = row;
      continue;
    }

    const currentProgress = Math.max(existing.currentProgress, row.currentProgress);
    const unlockedAt = existing.unlockedAt ?? row.unlockedAt;
    map[key] = {
      achievementId: row.achievementId,
      slug: row.slug || existing.slug,
      currentProgress:
        unlockedAt && currentProgress < target ? target : Math.min(currentProgress, target),
      unlockedAt,
    };
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
