import type { Grade } from '@/utils/grading';

export interface GradeThresholdSegment {
  label: string;
  min: number;
  max: number;
  color: string;
}

/** osu!-inspired accuracy bands mapped around the outer ring (0–100%). */
export const GRADE_THRESHOLD_SEGMENTS: GradeThresholdSegment[] = [
  { label: 'F', min: 0, max: 70, color: '#64748b' },
  { label: 'D', min: 70, max: 80, color: '#f87171' },
  { label: 'C', min: 80, max: 90, color: '#fb923c' },
  { label: 'B', min: 90, max: 95, color: '#facc15' },
  { label: 'A', min: 95, max: 98, color: '#a3e635' },
  { label: 'S', min: 98, max: 99.5, color: '#4ade80' },
  { label: 'SS', min: 99.5, max: 100, color: '#22d3ee' },
];

const TAU = Math.PI * 2;
const CENTER = { x: 50, y: 50 };

export function segmentActiveForGrade(segmentLabel: string, grade: Grade): boolean {
  if (grade === 'SS+' || grade === 'SS') return segmentLabel === 'SS';
  if (grade === 'S+' || grade === 'S') return segmentLabel === 'S';
  if (grade === 'A') return segmentLabel === 'A';
  if (grade === 'B') return segmentLabel === 'B';
  if (grade === 'C') return segmentLabel === 'C';
  if (grade === 'D') return segmentLabel === 'D';
  return segmentLabel === 'F';
}

function segmentLabelText(segmentLabel: string, grade: Grade): string {
  if (segmentLabel === 'SS' && grade === 'SS+') return 'SS+';
  if (segmentLabel === 'S' && grade === 'S+') return 'S+';
  return segmentLabel;
}

/** Map accuracy % to radians on the SVG circle (0% = 3 o'clock, clockwise). */
function percentToRadians(percent: number): number {
  return (percent / 100) * TAU;
}

/** Polar coords on the donut orbit (viewBox space, pre CSS rotation). */
export function polarOnOrbit(
  orbitRadius: number,
  angleRad: number,
): { x: number; y: number } {
  return {
    x: CENTER.x + orbitRadius * Math.cos(angleRad),
    y: CENTER.y + orbitRadius * Math.sin(angleRad),
  };
}

export function buildSegmentArcs(
  radius: number,
  grade: Grade,
): Array<{ key: string; dasharray: string; dashoffset: number; color: string; opacity: number }> {
  const circumference = TAU * radius;
  let offset = 0;

  return GRADE_THRESHOLD_SEGMENTS.map((segment) => {
    const length = ((segment.max - segment.min) / 100) * circumference;
    const active = segmentActiveForGrade(segment.label, grade);
    const arc = {
      key: segment.label,
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -offset,
      color: segment.color,
      opacity: active ? 1 : 0.28,
    };
    offset += length;
    return arc;
  });
}

export interface SegmentLabel {
  key: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

/** Place grade badges on an orbit outside the main ring, at each segment midpoint. */
export function buildSegmentLabels(orbitRadius: number, grade: Grade): SegmentLabel[] {
  const labelRadius = orbitRadius + 12;

  return GRADE_THRESHOLD_SEGMENTS.map((segment) => {
    const active = segmentActiveForGrade(segment.label, grade);
    const startAngle = percentToRadians(segment.min);
    const endAngle = percentToRadians(segment.max);
    const midAngle = (startAngle + endAngle) / 2;
    const { x, y } = polarOnOrbit(labelRadius, midAngle);

    return {
      key: segment.label,
      x,
      y,
      text: segmentLabelText(segment.label, grade),
      color: segment.color,
      opacity: active ? 1 : 0.45,
    };
  });
}
