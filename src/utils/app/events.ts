export const SESSION_COMPLETE_EVENT = 'typing-dvorak:session-complete';
export const KEY_STATS_UPDATED_EVENT = 'typing-dvorak:key-stats-updated';
export const BADGES_UPDATED_EVENT = 'typing-dvorak:badges-updated';
export const PROFILE_PREFERENCES_SYNCED_EVENT = 'typing-dvorak:profile-preferences-synced';

export function dispatchSessionComplete(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_COMPLETE_EVENT));
}

export function dispatchKeyStatsUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(KEY_STATS_UPDATED_EVENT));
}

export function dispatchBadgesUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BADGES_UPDATED_EVENT));
}

export function dispatchProfilePreferencesSynced(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROFILE_PREFERENCES_SYNCED_EVENT));
}
