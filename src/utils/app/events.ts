import type { SessionRecord } from '@/utils/progress/storage';

export const SESSION_COMPLETE_EVENT = 'typing-dvorak:session-complete';
export const KEY_STATS_UPDATED_EVENT = 'typing-dvorak:key-stats-updated';
export const BADGES_UPDATED_EVENT = 'typing-dvorak:badges-updated';
export const ACHIEVEMENTS_UNLOCKED_EVENT = 'typing-dvorak:achievements-unlocked';
export const PROFILE_PREFERENCES_SYNCED_EVENT = 'typing-dvorak:profile-preferences-synced';

export interface AchievementUnlockDetail {
  slug: string;
  title: string;
  tier: string;
  category: string;
}

export interface SessionCompleteDetail {
  /** Present only when a session was actually completed — triggers cloud sync. */
  record?: SessionRecord;
}

export function dispatchSessionComplete(record?: SessionRecord): void {
  if (typeof window === 'undefined') return;
  const detail: SessionCompleteDetail = record ? { record } : {};
  window.dispatchEvent(new CustomEvent(SESSION_COMPLETE_EVENT, { detail }));
}

export function dispatchKeyStatsUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(KEY_STATS_UPDATED_EVENT));
}

export function dispatchBadgesUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BADGES_UPDATED_EVENT));
}

export function dispatchAchievementsUnlocked(detail: AchievementUnlockDetail[]): void {
  if (typeof window === 'undefined' || detail.length === 0) return;
  window.dispatchEvent(new CustomEvent(ACHIEVEMENTS_UNLOCKED_EVENT, { detail }));
}

export function dispatchProfilePreferencesSynced(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROFILE_PREFERENCES_SYNCED_EVENT));
}

export function sessionCompleteDetail(event: Event): SessionCompleteDetail {
  return (event as CustomEvent<SessionCompleteDetail>).detail ?? {};
}
