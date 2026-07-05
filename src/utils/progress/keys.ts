/** Centralized localStorage keys — single source of truth for progress data. */
export const STORAGE_KEYS = {
  history: 'typing-dvorak-history',
  progress: 'typing-dvorak-progress',
  theme: 'typing-dvorak-theme',
  keyStats: 'typing-dvorak-key-stats',
  badges: 'typing-dvorak-badges',
  multiplayerStats: 'typing-dvorak-mp-stats',
  customText: 'typing-dvorak-custom-text',
  settings: 'typing-dvorak-settings',
  cloudMigrated: 'typing-dvorak-cloud-migrated',
  songProgress: 'typing-dvorak-song-progress',
} as const;

/** Cleared on login/logout to avoid cross-account bleed. */
export const GUEST_PROGRESS_KEYS = [
  STORAGE_KEYS.history,
  STORAGE_KEYS.progress,
  STORAGE_KEYS.keyStats,
  STORAGE_KEYS.badges,
  STORAGE_KEYS.customText,
  STORAGE_KEYS.cloudMigrated,
  STORAGE_KEYS.songProgress,
] as const;

/** Keys included in export/import backup bundles. */
export const EXPORT_KEYS = [
  STORAGE_KEYS.history,
  STORAGE_KEYS.progress,
  STORAGE_KEYS.keyStats,
  STORAGE_KEYS.settings,
  STORAGE_KEYS.badges,
  STORAGE_KEYS.theme,
  STORAGE_KEYS.customText,
] as const;
