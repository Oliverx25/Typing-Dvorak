import type { Locale } from '../../i18n';
import type { HighlightThemeId } from './highlightTheme';
import { applyHighlightTheme, DEFAULT_HIGHLIGHT_THEME, isHighlightThemeId } from './highlightTheme';
import { getStoredTheme } from '../progress/storage';
import { STORAGE_KEYS } from '../progress/keys';
import { readJson, writeJson } from '../progress/localStorage';

export type PracticeMode = 'practice' | 'test';

export interface AppSettings {
  locale: Locale;
  sound: boolean;
  blindMode: boolean;
  fingerColors: boolean;
  practiceMode: PracticeMode;
  highlightTheme: HighlightThemeId;
}

const DEFAULTS: AppSettings = {
  locale: 'en',
  sound: false,
  blindMode: false,
  fingerColors: true,
  practiceMode: 'practice',
  highlightTheme: DEFAULT_HIGHLIGHT_THEME,
};

export function getSettings(): AppSettings {
  const parsed = readJson(STORAGE_KEYS.settings, DEFAULTS);
  if (!isHighlightThemeId(parsed.highlightTheme)) {
    parsed.highlightTheme = DEFAULT_HIGHLIGHT_THEME;
  }
  return { ...DEFAULTS, ...parsed };
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
