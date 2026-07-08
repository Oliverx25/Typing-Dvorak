import type { CSSProperties } from 'react';

export interface SpotlightStyle {
  scale: number;
  opacity: number;
  blur: number;
}

/** Index-based volumetric falloff for the history list spotlight effect. */
export function getSpotlightStyle(
  hoveredIndex: number | null,
  index: number,
): SpotlightStyle {
  if (hoveredIndex === null) {
    return { scale: 1, opacity: 1, blur: 0 };
  }

  const distance = Math.abs(index - hoveredIndex);

  if (distance === 0) {
    return { scale: 1.02, opacity: 1, blur: 0 };
  }
  if (distance === 1) {
    return { scale: 0.98, opacity: 0.6, blur: 0 };
  }
  if (distance === 2) {
    return { scale: 0.95, opacity: 0.3, blur: 1 };
  }
  return { scale: 0.92, opacity: 0.15, blur: 2 };
}

export function spotlightInlineStyle(style: SpotlightStyle): CSSProperties {
  return {
    transform: `scale(${style.scale})`,
    opacity: style.opacity,
    filter: style.blur > 0 ? `blur(${style.blur}px)` : undefined,
  };
}
