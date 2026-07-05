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

export interface ProfilePreferencesRow {
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

/** Map a Supabase profile row into local app settings + theme overrides. */
export function appPreferencesFromProfile(
  profile: ProfilePreferencesRow,
): { settings: Partial<AppSettings>; theme?: Theme } {
  const settings: Partial<AppSettings> = {};

  if (profile.locale === 'en' || profile.locale === 'es') {
    settings.locale = profile.locale;
  }
  if (typeof profile.sound_enabled === 'boolean') settings.sound = profile.sound_enabled;
  if (typeof profile.blind_mode_enabled === 'boolean') settings.blindMode = profile.blind_mode_enabled;
  if (typeof profile.finger_colors_enabled === 'boolean') {
    settings.fingerColors = profile.finger_colors_enabled;
  }
  if (isPracticeMode(profile.practice_mode)) settings.practiceMode = profile.practice_mode;
  if (isHighlightThemeId(profile.highlight_theme)) {
    settings.highlightTheme = profile.highlight_theme;
  }
  if (typeof profile.zen_mode_enabled === 'boolean') settings.zenMode = profile.zen_mode_enabled;
  if (typeof profile.ghost_mode_enabled === 'boolean') settings.ghostMode = profile.ghost_mode_enabled;
  if (typeof profile.pacer_enabled === 'boolean') settings.pacerEnabled = profile.pacer_enabled;
  if (typeof profile.pacer_target_wpm === 'number') {
    settings.pacerTargetWpm = clampPacerWpm(profile.pacer_target_wpm);
  }

  const theme = isTheme(profile.theme) ? profile.theme : undefined;

  return { settings, theme };
}

/** Map local app settings + theme into a Supabase profiles update payload. */
export function profilePayloadFromAppPreferences(
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
