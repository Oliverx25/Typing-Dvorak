export const SESSION_COMPLETE_EVENT = 'typing-dvorak:session-complete';
export const KEY_STATS_UPDATED_EVENT = 'typing-dvorak:key-stats-updated';

export function dispatchSessionComplete(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_COMPLETE_EVENT));
}

export function dispatchKeyStatsUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(KEY_STATS_UPDATED_EVENT));
}
