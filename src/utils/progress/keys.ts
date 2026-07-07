/** Centralized localStorage keys — single source of truth for progress data. */
export const STORAGE_KEYS = {
  /** Offline cache — synced to Supabase when authenticated. */
  history: 'typing-dvorak-history',
  progress: 'typing-dvorak-progress',
  keyStats: 'typing-dvorak-key-stats',
  badges: 'typing-dvorak-badges',
  achievementProgress: 'typing-dvorak-achievement-progress',
  customText: 'typing-dvorak-custom-text',
  cloudMigrated: 'typing-dvorak-cloud-migrated',
  legacyLessonsMigrated: 'typing-dvorak-legacy-lessons-migrated',
  cloudLegacyLessonsMigrated: 'typing-dvorak-cloud-legacy-lessons-migrated',
  songProgress: 'typing-dvorak-song-progress',
  /** UI preferences only — not cleared on login. */
  theme: 'typing-dvorak-theme',
  settings: 'typing-dvorak-settings',
  /** Multiplayer lobby stats — non-critical, guest-safe. */
  multiplayerStats: 'typing-dvorak-mp-stats',
} as const;

/** UI-only keys — survive login/logout (theme, caret, locale, etc.). */
export const UI_STORAGE_KEYS = [
  STORAGE_KEYS.theme,
  STORAGE_KEYS.settings,
] as const;

/** Progress cache keys — cleared on login/logout to avoid cross-account bleed. */
export const PROGRESS_CACHE_KEYS = [
  STORAGE_KEYS.history,
  STORAGE_KEYS.progress,
  STORAGE_KEYS.keyStats,
  STORAGE_KEYS.badges,
  STORAGE_KEYS.achievementProgress,
  STORAGE_KEYS.customText,
  STORAGE_KEYS.cloudMigrated,
  STORAGE_KEYS.legacyLessonsMigrated,
  STORAGE_KEYS.songProgress,
] as const;

/** Cleared on login/logout to avoid cross-account bleed. */
export const GUEST_PROGRESS_KEYS = PROGRESS_CACHE_KEYS;

/** Keys included in export/import backup bundles. */
export const EXPORT_KEYS = [
  STORAGE_KEYS.history,
  STORAGE_KEYS.progress,
  STORAGE_KEYS.keyStats,
  STORAGE_KEYS.settings,
  STORAGE_KEYS.badges,
  STORAGE_KEYS.achievementProgress,
  STORAGE_KEYS.theme,
  STORAGE_KEYS.customText,
] as const;
