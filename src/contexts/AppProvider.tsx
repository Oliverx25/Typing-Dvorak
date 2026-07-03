import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getTranslations, type Locale, type TranslationKey } from '../i18n';
import { getSettings, saveSettings, type AppSettings, type PracticeMode } from '../utils/settings';
import { getStoredTheme, setStoredTheme, type Theme } from '../utils/storage';

interface AppContextValue {
  locale: Locale;
  t: TranslationKey;
  settings: AppSettings;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  setPracticeMode: (mode: PracticeMode) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  locale: 'en',
  sound: false,
  blindMode: false,
  fingerColors: true,
  practiceMode: 'practice',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setSettings(getSettings());
    setTheme(getStoredTheme());
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    const next = saveSettings(partial);
    setSettings(next);
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    updateSettings({ locale });
  }, [updateSettings]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setStoredTheme(next);
  }, [theme]);

  const setPracticeMode = useCallback((mode: PracticeMode) => {
    updateSettings({ practiceMode: mode });
  }, [updateSettings]);

  const value = useMemo<AppContextValue>(
    () => ({
      locale: settings.locale,
      t: getTranslations(settings.locale),
      settings,
      theme,
      setLocale,
      updateSettings,
      toggleTheme,
      setPracticeMode,
    }),
    [settings, theme, setLocale, updateSettings, toggleTheme, setPracticeMode],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/** Safe hook for components that may render outside provider during SSR. */
export function useAppSafe(): AppContextValue | null {
  return useContext(AppContext);
}

export function getLessonTitle(t: TranslationKey, key: string): string {
  const meta = t.lessonMeta[key as keyof typeof t.lessonMeta];
  return meta?.title ?? key;
}

export function getLessonDescription(t: TranslationKey, key: string): string {
  const meta = t.lessonMeta[key as keyof typeof t.lessonMeta];
  return meta?.description ?? key;
}
