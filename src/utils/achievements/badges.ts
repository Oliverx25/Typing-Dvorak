import type { IconName } from '@/components/ui/icons/Icon';
import { dispatchBadgesUpdated } from '../app/events';
import { STORAGE_KEYS } from '../progress/keys';
import { readJson, writeJson } from '../progress/localStorage';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_FAMILY_ICONS,
  getAchievementById,
  type AchievementDefinition,
  type AchievementFamily,
  type AchievementTier,
} from './achievements.config';
import { buildUserAchievementStatsFromLocal } from './userStats';

export interface BadgeProgressState {
  current: number;
  target: number;
}

export interface Badge {
  id: string;
  family: AchievementFamily;
  tier?: AchievementTier;
  icon: IconName;
  titleKey: string;
  descKey: string;
}

const LEGACY_BADGE_IDS = new Set([
  'first-lesson',
  'streak-7',
  'wpm-50',
  'perfect-run',
  'curriculum-done',
]);

/** @deprecated Use ACHIEVEMENTS — kept for backward-compatible imports. */
export const BADGES: Badge[] = ACHIEVEMENTS.map(toBadgeView);

function toBadgeView(definition: AchievementDefinition): Badge {
  return {
    id: definition.id,
    family: definition.family,
    tier: definition.tier,
    icon: ACHIEVEMENT_FAMILY_ICONS[definition.family],
    titleKey: definition.titleKey,
    descKey: definition.descKey,
  };
}

export function getUnlockedBadges(): string[] {
  const stored = readJson(STORAGE_KEYS.badges, [] as string[]);
  if (stored.some((id) => LEGACY_BADGE_IDS.has(id))) {
    const next = evaluateUnlockedBadges(buildUserAchievementStatsFromLocal());
    saveUnlockedBadges(next);
    return next;
  }
  return stored;
}

function saveUnlockedBadges(ids: string[]): void {
  writeJson(STORAGE_KEYS.badges, ids);
}

/** Overwrite unlocked badges (e.g. after cloud load). */
export function replaceUnlockedBadges(ids: string[]): void {
  saveUnlockedBadges(ids);
  dispatchBadgesUpdated();
}

/** @deprecated Use buildUserAchievementStatsFromLocal */
export function buildBadgeEvaluationFromLocal() {
  return buildUserAchievementStatsFromLocal();
}

/** Pure evaluation — iterates achievement config instead of isolated conditionals. */
export function evaluateUnlockedBadges(stats: ReturnType<typeof buildUserAchievementStatsFromLocal>): string[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.condition(stats)).map(
    (achievement) => achievement.id,
  );
}

export function getBadgeProgressState(
  badgeId: string,
  stats: ReturnType<typeof buildUserAchievementStatsFromLocal>,
): BadgeProgressState | null {
  const achievement = getAchievementById(badgeId);
  if (!achievement) return null;
  return achievement.progress(stats);
}

export function checkAndUnlockBadges(_session?: {
  accuracy?: number;
  wpm?: number;
  lessonId?: string;
  maxCombo?: number;
}): string[] {
  void _session;
  const stats = buildUserAchievementStatsFromLocal();
  const next = evaluateUnlockedBadges(stats);
  const previous = new Set(getUnlockedBadges());
  const newly = next.filter((id) => !previous.has(id));

  if (newly.length > 0 || next.length !== previous.size) {
    replaceUnlockedBadges(next);
  }

  return newly;
}

export function checkAchievements(
  stats: ReturnType<typeof buildUserAchievementStatsFromLocal>,
  alreadyUnlocked: string[],
): string[] {
  const owned = new Set(alreadyUnlocked);
  return ACHIEVEMENTS.filter(
    (achievement) => !owned.has(achievement.id) && achievement.condition(stats),
  ).map((achievement) => achievement.id);
}
