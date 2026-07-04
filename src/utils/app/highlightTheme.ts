import type { Theme } from '../progress/storage';
import { getSettings } from './settings';
import { getStoredTheme } from '../progress/storage';

export type HighlightThemeId = 'indigo' | 'emerald' | 'cyan' | 'red' | 'amber' | 'fuchsia';

export const HIGHLIGHT_THEME_IDS: HighlightThemeId[] = [
  'indigo',
  'emerald',
  'cyan',
  'red',
  'amber',
  'fuchsia',
];

interface ThemePair {
  main: string;
  hover: string;
}

export interface HighlightThemePreset {
  swatch: string;
  light: ThemePair;
  dark: ThemePair;
}

export const HIGHLIGHT_THEMES: Record<HighlightThemeId, HighlightThemePreset> = {
  indigo: {
    swatch: '#818cf8',
    light: { main: '#6366f1', hover: '#4f46e5' },
    dark: { main: '#818cf8', hover: '#6366f1' },
  },
  emerald: {
    swatch: '#4ade80',
    light: { main: '#22c55e', hover: '#16a34a' },
    dark: { main: '#4ade80', hover: '#22c55e' },
  },
  cyan: {
    swatch: '#22d3ee',
    light: { main: '#0891b2', hover: '#0e7490' },
    dark: { main: '#22d3ee', hover: '#06b6d4' },
  },
  red: {
    swatch: '#f87171',
    light: { main: '#dc2626', hover: '#b91c1c' },
    dark: { main: '#f87171', hover: '#ef4444' },
  },
  amber: {
    swatch: '#fbbf24',
    light: { main: '#d97706', hover: '#b45309' },
    dark: { main: '#fbbf24', hover: '#f59e0b' },
  },
  fuchsia: {
    swatch: '#e879f9',
    light: { main: '#c026d3', hover: '#a21caf' },
    dark: { main: '#e879f9', hover: '#d946ef' },
  },
};

export const DEFAULT_HIGHLIGHT_THEME: HighlightThemeId = 'indigo';

export function isHighlightThemeId(value: unknown): value is HighlightThemeId {
  return typeof value === 'string' && HIGHLIGHT_THEME_IDS.includes(value as HighlightThemeId);
}

/** Apply user highlight theme and sync accent tokens used across interactive UI. */
export function applyHighlightTheme(id: HighlightThemeId, mode: Theme): void {
  if (typeof document === 'undefined') return;
  const preset = HIGHLIGHT_THEMES[id] ?? HIGHLIGHT_THEMES.indigo;
  const pair = mode === 'dark' ? preset.dark : preset.light;
  document.documentElement.style.setProperty('--color-highlight', pair.main);
  document.documentElement.style.setProperty('--color-highlight-hover', pair.hover);
  document.documentElement.style.setProperty('--color-accent', pair.main);
  document.documentElement.style.setProperty('--color-accent-hover', pair.hover);
}

/** Read settings + theme from storage and apply highlight (for early init). */
export function initHighlightTheme(): void {
  if (typeof window === 'undefined') return;
  const { highlightTheme } = getSettings();
  applyHighlightTheme(highlightTheme, getStoredTheme());
}
