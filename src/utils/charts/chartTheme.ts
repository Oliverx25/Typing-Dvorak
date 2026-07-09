export interface ChartThemeColors {
  muted: string;
  grid: string;
  axis: string;
  reference: string;
  surface: string;
  highlight: string;
}

/** Reads chart axis/grid colors from CSS variables so Recharts matches the active theme. */
export function readChartThemeColors(): ChartThemeColors {
  if (typeof document === 'undefined') {
    return {
      muted: '#64748b',
      grid: 'rgba(226, 232, 240, 0.9)',
      axis: 'rgba(203, 213, 225, 0.9)',
      reference: 'rgba(148, 163, 184, 0.55)',
      surface: '#ffffff',
      highlight: '#818cf8',
    };
  }

  const root = getComputedStyle(document.documentElement);
  const muted = root.getPropertyValue('--color-text-muted').trim() || '#64748b';
  const surface = root.getPropertyValue('--color-surface-elevated').trim() || '#ffffff';
  const highlight = root.getPropertyValue('--color-highlight').trim() || '#818cf8';
  const isDark = document.documentElement.classList.contains('dark');

  return {
    muted,
    grid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.9)',
    axis: isDark ? 'rgba(71, 85, 105, 0.7)' : 'rgba(203, 213, 225, 0.95)',
    reference: isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(148, 163, 184, 0.65)',
    surface,
    highlight,
  };
}
