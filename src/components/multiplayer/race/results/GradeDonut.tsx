import { memo } from 'react';
import Icon from '@/components/ui/icons/Icon';
import { type Grade, gradeRingClass } from '@/utils/grading';
import { buildSegmentArcs, buildSegmentLabels } from '@/components/multiplayer/race/results/gradeDonutSegments';

interface GradeDonutProps {
  grade: Grade;
  accuracy: number;
  size?: 'md' | 'lg';
}

// osu!lazer style: thick accuracy fill ring (outer) + thin segmented thresholds ring (inner).
const FILL_RADIUS = 46;
const THRESHOLD_RADIUS = 38;

function GradeDonut({ grade, accuracy, size = 'lg' }: GradeDonutProps) {
  const outer = size === 'lg' ? 'h-44 w-44' : 'h-32 w-32';
  const gradeText = size === 'lg' ? 'text-5xl' : 'text-3xl';
  const isSpecial = grade === 'SS+' || grade === 'S+';
  const ringClass = gradeRingClass(grade);

  const thresholdArcs = buildSegmentArcs(THRESHOLD_RADIUS, grade);
  // Labels sit near the outer ring, anchored to the start of each threshold.
  const segmentLabels = buildSegmentLabels(FILL_RADIUS, grade);
  const fillCircumference = 2 * Math.PI * FILL_RADIUS;
  const safeAccuracy = Math.max(0, Math.min(100, accuracy));
  const accuracyLength = (safeAccuracy / 100) * fillCircumference;
  const missLength = fillCircumference - accuracyLength;

  return (
    <div className={`relative ${outer}`} aria-hidden>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        {/* Thick accuracy fill ring (outer) */}
        <circle
          cx="50"
          cy="50"
          r={FILL_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="9"
        />
        {missLength > 0.5 ? (
          <circle
            cx="50"
            cy="50"
            r={FILL_RADIUS}
            fill="none"
            stroke="#ef4444"
            strokeWidth="9"
            strokeLinecap="butt"
            strokeDasharray={`${missLength} ${fillCircumference}`}
            strokeDashoffset={-accuracyLength}
            opacity={0.85}
          />
        ) : null}
        <circle
          cx="50"
          cy="50"
          r={FILL_RADIUS}
          fill="none"
          stroke="#34d399"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${accuracyLength} ${fillCircumference}`}
        />

        {segmentLabels.map((label) => (
          <text
            key={`label-${label.key}`}
            x={label.x}
            y={label.y}
            fill={`rgba(255,255,255,${label.opacity})`}
            fontSize={size === 'lg' ? 6.5 : 6}
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(90 ${label.x} ${label.y})`}
          >
            {label.text}
          </text>
        ))}

        {/* Thin segmented thresholds ring (inner) */}
        <circle
          cx="50"
          cy="50"
          r={THRESHOLD_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        {thresholdArcs.map((arc) => (
          <circle
            key={arc.key}
            cx="50"
            cy="50"
            r={THRESHOLD_RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth="3"
            strokeDasharray={arc.dasharray}
            strokeDashoffset={arc.dashoffset}
            opacity={arc.opacity}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isSpecial ? (
          <Icon
            name={grade === 'SS+' ? 'crown' : 'sparkles'}
            size={size === 'lg' ? 16 : 13}
            className="mb-0.5 text-white/90"
          />
        ) : null}
        <span
          className={[
            'font-black tracking-tight text-transparent bg-gradient-to-br bg-clip-text',
            gradeText,
            ringClass,
          ].join(' ')}
        >
          {grade}
        </span>
      </div>
    </div>
  );
}

export default memo(GradeDonut, (prev, next) => {
  return prev.grade === next.grade && prev.accuracy === next.accuracy && prev.size === next.size;
});
