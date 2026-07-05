import { describe, expect, it } from 'vitest';
import { appPreferencesFromUserSettings, userSettingsPayloadFromAppPreferences } from './settingsSync';
import type { AppSettings } from './settings';

const BASE_SETTINGS: AppSettings = {
  locale: 'es',
  sound: true,
  blindMode: true,
  fingerColors: false,
  practiceMode: 'test',
  highlightTheme: 'emerald',
  zenMode: true,
  ghostMode: true,
  pacerEnabled: true,
  pacerTargetWpm: 80,
};

describe('settingsSync', () => {
  it('maps profile row to local settings and theme', () => {
    const { settings, theme } = appPreferencesFromUserSettings({
      locale: 'en',
      sound_enabled: false,
      blind_mode_enabled: true,
      finger_colors_enabled: true,
      practice_mode: 'practice',
      highlight_theme: 'cyan',
      theme: 'dark',
      zen_mode_enabled: false,
      ghost_mode_enabled: true,
      pacer_enabled: false,
      pacer_target_wpm: 120,
    });

    expect(settings).toEqual({
      locale: 'en',
      sound: false,
      blindMode: true,
      fingerColors: true,
      practiceMode: 'practice',
      highlightTheme: 'cyan',
      zenMode: false,
      ghostMode: true,
      pacerEnabled: false,
      pacerTargetWpm: 120,
    });
    expect(theme).toBe('dark');
  });

  it('maps local settings and theme to profile payload', () => {
    expect(userSettingsPayloadFromAppPreferences(BASE_SETTINGS, 'light')).toEqual({
      locale: 'es',
      sound_enabled: true,
      blind_mode_enabled: true,
      finger_colors_enabled: false,
      practice_mode: 'test',
      highlight_theme: 'emerald',
      theme: 'light',
      zen_mode_enabled: true,
      ghost_mode_enabled: true,
      pacer_enabled: true,
      pacer_target_wpm: 80,
    });
  });

  it('ignores invalid profile values', () => {
    const { settings, theme } = appPreferencesFromUserSettings({
      locale: 'fr',
      practice_mode: 'invalid',
      highlight_theme: 'not-a-theme',
      theme: 'auto',
    });

    expect(settings.locale).toBeUndefined();
    expect(settings.practiceMode).toBeUndefined();
    expect(settings.highlightTheme).toBeUndefined();
    expect(theme).toBeUndefined();
  });

  it('clamps pacer WPM in outbound payload', () => {
    const payload = userSettingsPayloadFromAppPreferences(
      { ...BASE_SETTINGS, pacerTargetWpm: 999 },
      'dark',
    );
    expect(payload.pacer_target_wpm).toBe(300);
    expect(payload.theme).toBe('dark');
  });
});
