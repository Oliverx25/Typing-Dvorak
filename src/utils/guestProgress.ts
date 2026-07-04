/** localStorage keys tied to a user session — cleared on login/logout to avoid cross-account bleed. */
export const GUEST_PROGRESS_KEYS = [
  'typing-dvorak-history',
  'typing-dvorak-progress',
  'typing-dvorak-key-stats',
  'typing-dvorak-badges',
  'typing-dvorak-custom-text',
  'typing-dvorak-cloud-migrated',
] as const;

export function clearGuestProgress(): void {
  if (typeof window === 'undefined') return;
  for (const key of GUEST_PROGRESS_KEYS) {
    localStorage.removeItem(key);
  }
}
