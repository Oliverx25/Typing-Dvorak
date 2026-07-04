import type { Locale } from '../i18n';
import type { HighlightThemeId } from './highlightTheme';
import { applyHighlightTheme, DEFAULT_HIGHLIGHT_THEME, isHighlightThemeId } from './highlightTheme';
import { getStoredTheme } from './storage';

export type PracticeMode = 'practice' | 'test';

export interface AppSettings {
  locale: Locale;
  sound: boolean;
  blindMode: boolean;
  fingerColors: boolean;
  practiceMode: PracticeMode;
  highlightTheme: HighlightThemeId;
}

const SETTINGS_KEY = 'typing-dvorak-settings';

const DEFAULTS: AppSettings = {
  locale: 'en',
  sound: false,
  blindMode: false,
  fingerColors: true,
  practiceMode: 'practice',
  highlightTheme: DEFAULT_HIGHLIGHT_THEME,
};

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as AppSettings;
    if (!isHighlightThemeId(parsed.highlightTheme)) {
      parsed.highlightTheme = DEFAULT_HIGHLIGHT_THEME;
    }
    return parsed;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  document.documentElement.lang = next.locale;
  applyHighlightTheme(next.highlightTheme, getStoredTheme());
  return next;
}

export function initLocale(): void {
  const { locale } = getSettings();
  document.documentElement.lang = locale;
}
