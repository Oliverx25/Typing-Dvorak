import type { Locale } from '../../i18n';
import type { HighlightThemeId } from './highlightTheme';
import { applyHighlightTheme, DEFAULT_HIGHLIGHT_THEME, isHighlightThemeId } from './highlightTheme';
import { getStoredTheme } from '../progress/storage';
import { STORAGE_KEYS } from '../progress/keys';
import { readJson, writeJson } from '../progress/localStorage';

export type PracticeMode = 'practice' | 'test';

export const PACER_MIN_WPM = 10;
export const PACER_MAX_WPM = 300;
export const PACER_DEFAULT_WPM = 60;

export interface AppSettings {
  locale: Locale;
  sound: boolean;
  blindMode: boolean;
  fingerColors: boolean;
  practiceMode: PracticeMode;
  highlightTheme: HighlightThemeId;
  zenMode: boolean;
  ghostMode: boolean;
  pacerEnabled: boolean;
  pacerTargetWpm: number;
}

const DEFAULTS: AppSettings = {
  locale: 'en',
  sound: false,
  blindMode: false,
  fingerColors: true,
  practiceMode: 'practice',
  highlightTheme: DEFAULT_HIGHLIGHT_THEME,
  zenMode: false,
  ghostMode: false,
  pacerEnabled: false,
  pacerTargetWpm: PACER_DEFAULT_WPM,
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
