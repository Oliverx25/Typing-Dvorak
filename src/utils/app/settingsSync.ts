import type { Locale } from '../../i18n';
import type { AppSettings, PracticeMode } from './settings';
import { clampPacerWpm } from './settings';
import { isHighlightThemeId } from './highlightTheme';
import type { Theme } from '../progress/storage';

function isPracticeMode(value: unknown): value is PracticeMode {
  return value === 'practice' || value === 'test';
}

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export interface UserSettingsRow {
  locale?: Locale | null;
  sound_enabled?: boolean;
  blind_mode_enabled?: boolean;
  finger_colors_enabled?: boolean;
  practice_mode?: PracticeMode | string | null;
  highlight_theme?: string | null;
  theme?: string | null;
  zen_mode_enabled?: boolean;
  ghost_mode_enabled?: boolean;
  pacer_enabled?: boolean;
  pacer_target_wpm?: number;
}

/** Map user_settings fields into local app settings + theme overrides. */
export function appPreferencesFromUserSettings(
  settings: UserSettingsRow,
): { settings: Partial<AppSettings>; theme?: Theme } {
  const partial: Partial<AppSettings> = {};

  if (settings.locale === 'en' || settings.locale === 'es') {
    partial.locale = settings.locale;
  }
  if (typeof settings.sound_enabled === 'boolean') partial.sound = settings.sound_enabled;
  if (typeof settings.blind_mode_enabled === 'boolean') partial.blindMode = settings.blind_mode_enabled;
  if (typeof settings.finger_colors_enabled === 'boolean') {
    partial.fingerColors = settings.finger_colors_enabled;
  }
  if (isPracticeMode(settings.practice_mode)) partial.practiceMode = settings.practice_mode;
  if (isHighlightThemeId(settings.highlight_theme)) {
    partial.highlightTheme = settings.highlight_theme;
  }
  if (typeof settings.zen_mode_enabled === 'boolean') partial.zenMode = settings.zen_mode_enabled;
  if (typeof settings.ghost_mode_enabled === 'boolean') partial.ghostMode = settings.ghost_mode_enabled;
  if (typeof settings.pacer_enabled === 'boolean') partial.pacerEnabled = settings.pacer_enabled;
  if (typeof settings.pacer_target_wpm === 'number') {
    partial.pacerTargetWpm = clampPacerWpm(settings.pacer_target_wpm);
  }

  const theme = isTheme(settings.theme) ? settings.theme : undefined;

  return { settings: partial, theme };
}

/** @deprecated Use appPreferencesFromUserSettings */
export function appPreferencesFromProfile(
  row: UserSettingsRow,
): ReturnType<typeof appPreferencesFromUserSettings> {
  return appPreferencesFromUserSettings(row);
}

/** Map local app settings + theme into a user_settings upsert payload. */
export function userSettingsPayloadFromAppPreferences(
  settings: AppSettings,
  theme: Theme,
): Record<string, string | boolean | number> {
  return {
    locale: settings.locale,
    sound_enabled: settings.sound,
    blind_mode_enabled: settings.blindMode,
    finger_colors_enabled: settings.fingerColors,
    practice_mode: settings.practiceMode,
    highlight_theme: settings.highlightTheme,
    theme,
    zen_mode_enabled: settings.zenMode,
    ghost_mode_enabled: settings.ghostMode,
    pacer_enabled: settings.pacerEnabled,
    pacer_target_wpm: clampPacerWpm(settings.pacerTargetWpm),
  };
}

/** @deprecated Use userSettingsPayloadFromAppPreferences */
export function profilePayloadFromAppPreferences(
  settings: AppSettings,
  theme: Theme,
): Record<string, string | boolean | number> {
  return userSettingsPayloadFromAppPreferences(settings, theme);
}
