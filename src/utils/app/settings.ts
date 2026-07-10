import type { Locale } from '@/i18n';
import type { HighlightThemeId } from '@/utils/app/highlightTheme';
import { applyHighlightTheme, DEFAULT_HIGHLIGHT_THEME, isHighlightThemeId } from '@/utils/app/highlightTheme';
import type { HardwareLayout } from '@/utils/keyboard/keyboardLayouts';
import type { OsPreference } from '@/utils/keyboard/keyboardLayouts';
import { getStoredTheme } from '@/utils/progress/storage';
import { STORAGE_KEYS } from '@/utils/progress/keys';
import { readJson, writeJson } from '@/utils/progress/localStorage';

export type PracticeMode = 'practice' | 'test';

export const PACER_MIN_WPM = 10;
export const PACER_MAX_WPM = 300;
export const PACER_DEFAULT_WPM = 60;

export type CaretStyle = 'line' | 'block' | 'underline';
export type CaretAnimation = 'smooth' | 'blink' | 'off';

export type { HardwareLayout, OsPreference };

export interface AppSettings {
  locale: Locale;
  sound: boolean;
  blindMode: boolean;
  fingerColors: boolean;
  hardwareLayout: HardwareLayout;
  osPreference: OsPreference;
  practiceMode: PracticeMode;
  highlightTheme: HighlightThemeId;
  zenMode: boolean;
  ghostMode: boolean;
  pacerEnabled: boolean;
  pacerTargetWpm: number;
  caretStyle: CaretStyle;
  caretAnimation: CaretAnimation;
  stopOnError: boolean;
  stopOnWord: boolean;
}

const DEFAULTS: AppSettings = {
  locale: 'en',
  sound: false,
  blindMode: false,
  fingerColors: true,
  hardwareLayout: 'ANSI',
  osPreference: 'Mac',
  practiceMode: 'practice',
  highlightTheme: DEFAULT_HIGHLIGHT_THEME,
  zenMode: false,
  ghostMode: false,
  pacerEnabled: false,
  pacerTargetWpm: PACER_DEFAULT_WPM,
  caretStyle: 'line',
  caretAnimation: 'blink',
  stopOnError: false,
  stopOnWord: false,
};

export function clampPacerWpm(value: number): number {
  if (!Number.isFinite(value)) return PACER_DEFAULT_WPM;
  return Math.min(PACER_MAX_WPM, Math.max(PACER_MIN_WPM, Math.round(value)));
}

export function getSettings(): AppSettings {
  const parsed = readJson(STORAGE_KEYS.settings, DEFAULTS);
  if (!isHighlightThemeId(parsed.highlightTheme)) {
    parsed.highlightTheme = DEFAULT_HIGHLIGHT_THEME;
  }
  const merged = { ...DEFAULTS, ...parsed };
  merged.pacerTargetWpm = clampPacerWpm(merged.pacerTargetWpm);
  if (!['ANSI', 'MAC_ISO'].includes(merged.hardwareLayout)) merged.hardwareLayout = 'ANSI';
  if (!['Mac', 'Windows'].includes(merged.osPreference)) merged.osPreference = 'Mac';
  if (!['line', 'block', 'underline'].includes(merged.caretStyle)) merged.caretStyle = 'line';
  if (!['smooth', 'blink', 'off'].includes(merged.caretAnimation)) merged.caretAnimation = 'blink';
  return merged;
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...partial };
  writeJson(STORAGE_KEYS.settings, next);
  document.documentElement.lang = next.locale;
  applyHighlightTheme(next.highlightTheme, getStoredTheme());
  return next;
}

export function initLocale(): void {
  const { locale } = getSettings();
  document.documentElement.lang = locale;
}
