import OffScreenIndicator from './OffScreenIndicator';
import PacingCursorMarker, { type PacingCursorVariant } from './PacingCursorMarker';
import type { PacingCursorVisibility } from '@/hooks/useVirtualizedTeleprompter';

interface PacingCursorEdgeHintProps {
  variant: PacingCursorVariant;
  charIndex: number | null;
  visibility: PacingCursorVisibility;
}

/** Viewport-level edge hint when a pacing cursor is outside the virtualized window. */
export function PacingCursorEdgeHint({
  variant,
  charIndex,
  visibility,
}: PacingCursorEdgeHintProps) {
  if (charIndex === null || !visibility.offScreen) return null;
  return <OffScreenIndicator direction={visibility.offScreen} variant={variant} />;
}

interface InlinePacingCursorMarkerProps {
  variant: PacingCursorVariant;
  charIndex: number | null;
  playerIndex: number;
  index: number;
  visibility: PacingCursorVisibility;
}

/** Inline marker on a character span when the pacing cursor is inside the visible window. */
export function InlinePacingCursorMarker({
  variant,
  charIndex,
  playerIndex,
  index,
  visibility,
}: InlinePacingCursorMarkerProps) {
  if (charIndex === null || index !== charIndex || index === playerIndex) return null;
  if (!visibility.isRenderable) return null;
  return <PacingCursorMarker variant={variant} />;
}
