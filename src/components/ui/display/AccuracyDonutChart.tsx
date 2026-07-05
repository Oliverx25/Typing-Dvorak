import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icons/Icon';
import { type Grade, gradeRingClass } from '@/utils/grading';

interface AccuracyDonutChartProps {
  accuracy: number;
  grade: Grade;
  animateKey?: string | number;
  size?: 'md' | 'lg';
}

function useAnimatedValue(target: number, animateKey: string | number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, animateKey]);

  return value;
}

export default function AccuracyDonutChart({
  accuracy,
  grade,
  animateKey = 'default',
  size = 'lg',
}: AccuracyDonutChartProps) {
  const animatedAccuracy = useAnimatedValue(accuracy, animateKey);
  const ringClass = gradeRingClass(grade);
  const isSpecial = grade === 'SS+' || grade === 'S+';
  const outer = size === 'lg' ? 'h-40 w-40' : 'h-28 w-28';
  const gradeText = size === 'lg' ? 'text-5xl' : 'text-3xl';

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const safeAccuracy = Math.max(0, Math.min(100, animatedAccuracy));
  const accuracyLength = (safeAccuracy / 100) * circumference;
  const errorLength = circumference - accuracyLength;

  return (
    <div className={`relative ${outer}`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        {errorLength > 0.5 ? (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-incorrect)"
            strokeWidth="6"
            strokeLinecap="butt"
            strokeDasharray={`${errorLength} ${circumference}`}
            strokeDashoffset={-accuracyLength}
            opacity={0.85}
          />
        ) : null}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-correct)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${accuracyLength} ${circumference}`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isSpecial ? (
          <Icon
            name={grade === 'SS+' ? 'crown' : 'sparkles'}
            size={size === 'lg' ? 16 : 13}
            className="mb-0.5 text-[var(--color-text)]"
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
