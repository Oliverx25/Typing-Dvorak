import { FINGER_CSS_VAR, type Finger } from '../utils/fingers';

interface HandSilhouetteProps {
  side: 'left' | 'right';
  activeFinger?: Finger;
}

const LEFT_ORDER: Finger[] = ['lp', 'lr', 'lm', 'li'];
const RIGHT_ORDER: Finger[] = ['ri', 'rm', 'rr', 'rp'];

/** Finger segment positions for top-down hand view. */
const FINGER_GEOMETRY: Record<Finger, { x: number; y: number; h: number; w: number; r: number }> = {
  lp: { x: 4, y: 28, h: 52, w: 14, r: 7 },
  lr: { x: 22, y: 18, h: 62, w: 15, r: 7 },
  lm: { x: 41, y: 10, h: 70, w: 16, r: 8 },
  li: { x: 61, y: 6, h: 74, w: 18, r: 8 },
  ri: { x: 21, y: 6, h: 74, w: 18, r: 8 },
  rm: { x: 43, y: 10, h: 70, w: 16, r: 8 },
  rr: { x: 63, y: 18, h: 62, w: 15, r: 7 },
  rp: { x: 82, y: 28, h: 52, w: 14, r: 7 },
};

function fingerFill(finger: Finger, active: boolean): string {
  if (active) {
    return `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 75%, var(--color-key-target-bg))`;
  }
  return `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 22%, var(--color-surface-elevated))`;
}

function FingerSegment({
  finger,
  active,
  mirrored,
}: {
  finger: Finger;
  active: boolean;
  mirrored?: boolean;
}) {
  const g = FINGER_GEOMETRY[finger];
  const x = mirrored ? 100 - g.x - g.w : g.x;

  return (
    <rect
      x={x}
      y={g.y}
      width={g.w}
      height={g.h}
      rx={g.r}
      fill={fingerFill(finger, active)}
      stroke={active ? 'var(--color-key-target)' : 'var(--color-border)'}
      strokeWidth={active ? 2 : 1}
      className="transition-all duration-200"
      style={
        active
          ? { filter: 'drop-shadow(0 0 6px color-mix(in srgb, var(--color-key-target) 40%, transparent))' }
          : undefined
      }
    />
  );
}

export default function HandSilhouette({ side, activeFinger }: HandSilhouetteProps) {
  const fingers = side === 'left' ? LEFT_ORDER : RIGHT_ORDER;
  const mirrored = side === 'right';

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-24 w-24 sm:h-28 sm:w-28"
      aria-hidden="true"
    >
      {/* Palm */}
      <ellipse
        cx="50"
        cy="88"
        rx={side === 'left' ? 38 : 38}
        ry="14"
        fill="color-mix(in srgb, var(--color-border) 30%, var(--color-surface-elevated))"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      {fingers.map((finger) => (
        <FingerSegment
          key={finger}
          finger={finger}
          active={activeFinger === finger}
          mirrored={mirrored}
        />
      ))}
      {/* Wrist */}
      <rect
        x="36"
        y="94"
        width="28"
        height="6"
        rx="3"
        fill="var(--color-border)"
        opacity="0.5"
      />
    </svg>
  );
}
