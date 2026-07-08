import type { CSSProperties } from 'react';

export interface SpotlightStyle {
  scale: number;
  opacity: number;
  blur: number;
}

/** Dimmed baseline when the list is not hovered — cards lift to full clarity on focus. */
const REST_STYLE: SpotlightStyle = { scale: 0.98, opacity: 0.85, blur: 0 };

/** Index-based volumetric falloff for the history list spotlight effect. */
export function getSpotlightStyle(
  hoveredIndex: number | null,
  index: number,
): SpotlightStyle {
  if (hoveredIndex === null) {
    return REST_STYLE;
  }

  const distance = Math.abs(index - hoveredIndex);

  if (distance === 0) {
    return { scale: 1.02, opacity: 1, blur: 0 };
  }
  if (distance === 1) {
    return { scale: 0.98, opacity: 0.75, blur: 0 };
  }
  if (distance === 2) {
    return { scale: 0.95, opacity: 0.55, blur: 0.5 };
  }
  // Legibility floor — depth cue without censoring distant cards.
  return { scale: 0.92, opacity: 0.45, blur: 1 };
}

export function spotlightInlineStyle(style: SpotlightStyle): CSSProperties {
  return {
    transform: `scale(${style.scale})`,
    opacity: style.opacity,
    // Always set blur to avoid "initial blur" / style remnants.
    filter: `blur(${style.blur}px)`,
  };
}
