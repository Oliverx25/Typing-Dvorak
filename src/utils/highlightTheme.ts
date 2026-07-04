import type { Theme } from './storage';

export type HighlightThemeId = 'indigo' | 'emerald' | 'cyan' | 'violet' | 'amber';

export const HIGHLIGHT_THEME_IDS: HighlightThemeId[] = [
  'indigo',
  'emerald',
  'cyan',
  'violet',
  'amber',
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
  violet: {
    swatch: '#a78bfa',
    light: { main: '#7c3aed', hover: '#6d28d9' },
    dark: { main: '#a78bfa', hover: '#8b5cf6' },
  },
  amber: {
    swatch: '#fbbf24',
    light: { main: '#d97706', hover: '#b45309' },
    dark: { main: '#fbbf24', hover: '#f59e0b' },
  },
};

export const DEFAULT_HIGHLIGHT_THEME: HighlightThemeId = 'indigo';

export function isHighlightThemeId(value: unknown): value is HighlightThemeId {
  return typeof value === 'string' && HIGHLIGHT_THEME_IDS.includes(value as HighlightThemeId);
}

export function applyHighlightTheme(id: HighlightThemeId, mode: Theme): void {
  if (typeof document === 'undefined') return;
  const preset = HIGHLIGHT_THEMES[id] ?? HIGHLIGHT_THEMES.indigo;
  const pair = mode === 'dark' ? preset.dark : preset.light;
  document.documentElement.style.setProperty('--color-highlight', pair.main);
  document.documentElement.style.setProperty('--color-highlight-hover', pair.hover);
}

/** Read settings + theme from storage and apply highlight (for early init). */
export function initHighlightTheme(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('typing-dvorak-settings');
    const settings = raw ? JSON.parse(raw) : {};
    const id = isHighlightThemeId(settings.highlightTheme)
      ? settings.highlightTheme
      : DEFAULT_HIGHLIGHT_THEME;
    const themeRaw = localStorage.getItem('typing-dvorak-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode: Theme =
      themeRaw === 'dark' || themeRaw === 'light' ? themeRaw : prefersDark ? 'dark' : 'light';
    applyHighlightTheme(id, mode);
  } catch {
    applyHighlightTheme(DEFAULT_HIGHLIGHT_THEME, 'light');
  }
}
