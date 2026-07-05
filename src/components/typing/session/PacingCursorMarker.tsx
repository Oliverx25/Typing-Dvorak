export type PacingCursorVariant = 'pacer' | 'ghost';

const MARKER_CLASS: Record<PacingCursorVariant, string> = {
  pacer: 'border-b-2 border-amber-500 bg-amber-500/30',
  ghost: 'bg-gray-400/20 outline outline-1 outline-gray-500',
};

interface PacingCursorMarkerProps {
  variant: PacingCursorVariant;
}

/** Inline cursor overlay for the musical hare or personal-best ghost. */
export default function PacingCursorMarker({ variant }: PacingCursorMarkerProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        'pointer-events-none absolute -bottom-0.5 left-0 top-0 w-0.5',
        MARKER_CLASS[variant],
      ].join(' ')}
    />
  );
}
