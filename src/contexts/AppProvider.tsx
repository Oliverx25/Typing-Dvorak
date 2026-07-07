import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getTranslations, type Locale, type TranslationKey } from '@/i18n';
import { getSettings, saveSettings, type AppSettings, type PracticeMode } from '@/utils/app/settings';
import { getStoredTheme, setStoredTheme, type Theme } from '@/utils/progress/storage';
import { applyHighlightTheme } from '@/utils/app/highlightTheme';
import { PROFILE_PREFERENCES_SYNCED_EVENT } from '@/utils/app/events';
import { syncAppSettingsToProfile } from '@/services/supabase/profile';

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
  highlightTheme: 'indigo',
  zenMode: false,
  ghostMode: false,
  pacerEnabled: false,
  pacerTargetWpm: 60,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedSettings = getSettings();
    const storedTheme = getStoredTheme();
    setSettings(storedSettings);
    setTheme(storedTheme);
    setStoredTheme(storedTheme);
    applyHighlightTheme(storedSettings.highlightTheme, storedTheme);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const storedSettings = getSettings();
      const storedTheme = getStoredTheme();
      setSettings(storedSettings);
      setTheme(storedTheme);
      applyHighlightTheme(storedSettings.highlightTheme, storedTheme);
    };
    window.addEventListener(PROFILE_PREFERENCES_SYNCED_EVENT, syncFromStorage);
    return () => window.removeEventListener(PROFILE_PREFERENCES_SYNCED_EVENT, syncFromStorage);
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    const next = saveSettings(partial);
    setSettings(next);
    void syncAppSettingsToProfile(next, getStoredTheme());
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    updateSettings({ locale });
  }, [updateSettings]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setStoredTheme(next);
    applyHighlightTheme(settings.highlightTheme, next);
    void syncAppSettingsToProfile(settings, next);
  }, [theme, settings]);

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
  const micro = t.microLessonMeta[key as keyof typeof t.microLessonMeta];
  if (micro?.title) return micro.title;
  const meta = t.lessonMeta[key as keyof typeof t.lessonMeta];
  if (meta?.title) return meta.title;
  return key;
}

export function getLessonDescription(t: TranslationKey, key: string): string {
  const micro = t.microLessonMeta[key as keyof typeof t.microLessonMeta];
  if (micro?.description) return micro.description;
  const meta = t.lessonMeta[key as keyof typeof t.lessonMeta];
  return meta?.description ?? key;
}
