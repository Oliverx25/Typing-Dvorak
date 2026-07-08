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
const LABEL_ORBIT = FILL_RADIUS + 9;

function GradeDonut({ grade, accuracy, size = 'lg' }: GradeDonutProps) {
  const outer = size === 'lg' ? 'h-44 w-44' : 'h-32 w-32';
  const gradeText = size === 'lg' ? 'text-5xl' : 'text-3xl';
  const badgeText = size === 'lg' ? 'text-[9px]' : 'text-[8px]';
  const isSpecial = grade === 'SS+' || grade === 'S+';
  const ringClass = gradeRingClass(grade);

  const thresholdArcs = buildSegmentArcs(THRESHOLD_RADIUS, grade);
  const segmentLabels = buildSegmentLabels(LABEL_ORBIT, grade);
  const fillCircumference = 2 * Math.PI * FILL_RADIUS;
  const safeAccuracy = Math.max(0, Math.min(100, accuracy));
  const accuracyLength = (safeAccuracy / 100) * fillCircumference;
  const missLength = fillCircumference - accuracyLength;

  return (
    <div className={`relative ${outer}`} aria-hidden>
      <svg
        className="h-full w-full -rotate-90 overflow-visible"
        viewBox="-8 -8 116 116"
      >
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

        {/* Orbital grade badges */}
        {segmentLabels.map((label) => (
          <g
            key={`label-${label.key}`}
            transform={`rotate(90 ${label.x} ${label.y})`}
          >
            <foreignObject
              x={label.x - 16}
              y={label.y - 9}
              width={32}
              height={18}
              className="overflow-visible"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className={[
                  'flex h-full w-full items-center justify-center rounded-full border border-white/15',
                  'bg-slate-950/85 px-1.5 font-bold leading-none text-white shadow-sm',
                  badgeText,
                ].join(' ')}
                style={{
                  opacity: label.opacity,
                  color: label.color,
                  borderColor: `${label.color}55`,
                }}
              >
                {label.text}
              </div>
            </foreignObject>
          </g>
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
