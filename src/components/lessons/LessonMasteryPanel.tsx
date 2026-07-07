import { useApp } from '@/contexts/AppProvider';
import { useLessonCardState } from '@/hooks/useLessonCardState';
import MasteryBadge, { formatMasteryRequirementsHint } from '@/components/lessons/MasteryBadge';
import type { MasteryTier } from '@/utils/curriculum/mastery';

interface LessonMasteryPanelProps {
  lessonId: string;
  size?: 'sm' | 'md';
  showProgress?: boolean;
  className?: string;
}

function tierLabelFor(t: ReturnType<typeof useApp>['t'], tier: MasteryTier): string {
  const map: Record<MasteryTier, string> = {
    0: t.mastery.label,
    1: t.mastery.bronze,
    2: t.mastery.silver,
    3: t.mastery.gold,
    4: t.mastery.diamond,
    5: t.mastery.ascended,
  };
  return map[tier];
}

export default function LessonMasteryPanel({
  lessonId,
  size = 'md',
  showProgress = true,
  className = '',
}: LessonMasteryPanelProps) {
  const { t } = useApp();
  const { masteryTier, masteryXp, masteryProgress, blockedRequirements } =
    useLessonCardState(lessonId);

  const requirementsHint = blockedRequirements
    ? formatMasteryRequirementsHint(
        blockedRequirements,
        blockedRequirements.minGrade
          ? t.home.masteryRequirementsGrade
          : t.home.masteryRequirements,
      )
    : null;

  if (masteryTier === 0 && masteryXp <= 0) return null;

  return (
    <MasteryBadge
      tier={masteryTier}
      xp={masteryXp}
      xpToNext={masteryProgress.xpToNext}
      progressCurrent={masteryProgress.current}
      progressNext={masteryProgress.next}
      tierLabel={tierLabelFor(t, masteryTier)}
      xpToNextLabel={t.home.masteryXpToNext}
      requirementsHint={requirementsHint}
      size={size}
      showProgress={showProgress}
      className={className}
    />
  );
}
