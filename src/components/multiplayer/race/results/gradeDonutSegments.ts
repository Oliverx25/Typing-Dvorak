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

export function buildSegmentArcs(
  radius: number,
  grade: Grade,
): Array<{ key: string; dasharray: string; dashoffset: number; color: string; opacity: number }> {
  const circumference = 2 * Math.PI * radius;
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

export function buildSegmentLabels(
  radius: number,
  grade: Grade,
): Array<{ key: string; x: number; y: number; text: string; opacity: number }> {
  const centerX = 50;
  const centerY = 50;
  const labelRadius = radius + 7.5;

  return GRADE_THRESHOLD_SEGMENTS.map((segment) => {
    const active = segmentActiveForGrade(segment.label, grade);
    // Labels anchor to the START of each threshold, like osu!lazer.
    // -90deg aligns 0% to top, matching the -rotate-90 applied on the SVG.
    const angleDeg = segment.min * 3.6 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = centerX + labelRadius * Math.cos(angleRad);
    const y = centerY + labelRadius * Math.sin(angleRad);

    return {
      key: segment.label,
      x,
      y,
      text: segmentLabelText(segment.label, grade),
      opacity: active ? 0.95 : 0.38,
    };
  });
}
