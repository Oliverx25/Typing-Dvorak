import { dispatchBadgesUpdated } from '@/utils/app/events';
import { notifyAchievementUnlocks } from '@/utils/achievements/achievementNotifications';
import {
  evaluateAchievementProgress,
  getNewlyUnlockedSlugs,
  snapshotFromSessionRecord,
  type LastSessionSnapshot,
} from '@/utils/achievements/achievementEvaluator';
import { recordMultiplayerMatch } from '@/utils/achievements/multiplayerStats';
import { CATALOG_BY_ID } from '@/utils/achievements/catalogData';
import {
  getProgressForAchievement,
  getUnlockedAchievementSlugs,
  replaceLocalAchievementProgress,
} from '@/utils/achievements/progressStorage';
import type { UserAchievementProgress } from '@/utils/achievements/catalogTypes';
import type { SessionRecord } from '@/utils/progress/storage';

export interface BadgeProgressState {
  current: number;
  target: number;
}

/** Run post-match achievement evaluation and return newly unlocked slugs. */
export function processAchievementsAfterSession(
  record?: SessionRecord,
  extras?: Partial<LastSessionSnapshot>,
): string[] {
  const snapshot = record ? snapshotFromSessionRecord(record, extras) : undefined;
  const results = evaluateAchievementProgress(snapshot);
  const newly = getNewlyUnlockedSlugs(results);
  if (newly.length > 0) {
    dispatchBadgesUpdated();
  }
  return newly;
}

/** Evaluate achievements after a singleplayer session and show unlock toasts. */
export function finalizeSingleplayerAchievements(
  record: SessionRecord,
  extras?: Partial<LastSessionSnapshot>,
): string[] {
  const newly = processAchievementsAfterSession(record, extras);
  notifyAchievementUnlocks(newly);
  return newly;
}

/** Record MP stats, evaluate achievements with full race context, and show toasts. */
export function finalizeMultiplayerAchievements(
  record: SessionRecord,
  extras: Partial<LastSessionSnapshot>,
  won: boolean,
): string[] {
  recordMultiplayerMatch(won);
  const newly = processAchievementsAfterSession(record, extras);
  notifyAchievementUnlocks(newly);
  return newly;
}

export function checkAndUnlockBadges(_session?: {
  accuracy?: number;
  wpm?: number;
  lessonId?: string;
  maxCombo?: number;
}): string[] {
  void _session;
  return processAchievementsAfterSession();
}

export function getUnlockedBadges(): string[] {
  return getUnlockedAchievementSlugs();
}

export function getBadgeProgressState(
  achievementId: number,
): BadgeProgressState | null {
  const progress = getProgressForAchievement(achievementId);
  const catalog = CATALOG_BY_ID.get(achievementId);
  if (!catalog) return null;
  return { current: progress.currentProgress, target: catalog.targetValue };
}

export function replaceUnlockedBadges(rows: UserAchievementProgress[]): void {
  replaceLocalAchievementProgress(rows);
  dispatchBadgesUpdated();
}

export { getProgressForAchievement, isAchievementUnlocked } from '@/utils/achievements/progressStorage';
