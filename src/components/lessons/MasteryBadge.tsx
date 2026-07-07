import { Icon } from '@/components/ui';
import {
  MASTERY_BADGE_CLASSES,
  MASTERY_TIER_LABELS,
  type MasteryTier,
  type MasteryTierRequirements,
} from '@/utils/curriculum/mastery';

interface MasteryBadgeProps {
  tier: MasteryTier;
  xp: number;
  xpToNext: number | null;
  progressCurrent: number;
  progressNext: number | null;
  tierLabel?: string;
  xpToNextLabel?: string;
  requirementsHint?: string | null;
  size?: 'sm' | 'md';
  showProgress?: boolean;
  className?: string;
}

export default function MasteryBadge({
  tier,
  xp,
  xpToNext,
  progressCurrent,
  progressNext,
  tierLabel,
  xpToNextLabel,
  requirementsHint,
  size = 'md',
  showProgress = true,
  className = '',
}: MasteryBadgeProps) {
  const iconSize = size === 'sm' ? 12 : 14;
  const textClass = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  const barHeight = size === 'sm' ? 'h-1' : 'h-1.5';
  const badgeClass = MASTERY_BADGE_CLASSES[tier];
  const label = tierLabel ?? (tier > 0 ? MASTERY_TIER_LABELS[tier] : '');

  const progressPct =
    progressNext && progressNext > 0
      ? Math.min(100, Math.round((progressCurrent / progressNext) * 100))
      : tier >= 5
        ? 100
        : 0;

  const showXpBar = showProgress && (tier < 5 || xpToNext != null);

  if (tier === 0 && xp <= 0 && !showXpBar) return null;

  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      <div className={['flex items-center gap-1 font-semibold uppercase tracking-wider', textClass, badgeClass].join(' ')}>
        <Icon name="award" size={iconSize} />
        {tier > 0 ? <span>{label}</span> : <span className="normal-case text-[var(--color-text-muted)]">{label}</span>}
      </div>

      {showXpBar && (
        <div className="w-full min-w-[5rem]">
          <div className={`${barHeight} overflow-hidden rounded-full bg-[var(--color-border)]`}>
            <div
              className={[
                'h-full rounded-full transition-all duration-500',
                tier >= 5
                  ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500'
                  : 'bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-highlight-hover)]',
              ].join(' ')}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {xpToNext != null && xpToNext > 0 && xpToNextLabel ? (
            <p className="mt-0.5 text-[9px] text-[var(--color-text-muted)]">
              {xpToNextLabel.replace('{xp}', String(xpToNext))}
            </p>
          ) : null}
          {requirementsHint ? (
            <p className="mt-0.5 text-[9px] text-amber-400/90">{requirementsHint}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function formatMasteryRequirementsHint(
  requirements: MasteryTierRequirements,
  templates: {
    default: string;
    withGrade: string;
    test: string;
    testWithGrade: string;
  },
): string {
  const template = requirements.testMode
    ? requirements.minGrade
      ? templates.testWithGrade
      : templates.test
    : requirements.minGrade
      ? templates.withGrade
      : templates.default;

  return template
    .replace('{wpm}', String(requirements.minWpm))
    .replace('{accuracy}', String(requirements.minAccuracy))
    .replace('{grade}', requirements.minGrade ?? 'S');
}
