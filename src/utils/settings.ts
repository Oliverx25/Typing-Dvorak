import type { Locale } from '../i18n';

export type PracticeMode = 'practice' | 'test';

export interface AppSettings {
  locale: Locale;
  sound: boolean;
  blindMode: boolean;
  fingerColors: boolean;
  practiceMode: PracticeMode;
}

const SETTINGS_KEY = 'typing-dvorak-settings';

const DEFAULTS: AppSettings = {
  locale: 'en',
  sound: false,
  blindMode: false,
  fingerColors: true,
  practiceMode: 'practice',
};

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  document.documentElement.lang = next.locale;
  return next;
}

export function initLocale(): void {
  const { locale } = getSettings();
  document.documentElement.lang = locale;
}
