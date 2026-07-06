import { gradeRank } from '../grading';

/** Mastery tier thresholds (cumulative XP). */
export const MASTERY_TIER_THRESHOLDS = {
  bronze: 25,
  silver: 75,
  gold: 150,
  diamond: 300,
} as const;

export type MasteryTier = 0 | 1 | 2 | 3 | 4;

export const MASTERY_TIER_LABELS: Record<MasteryTier, string> = {
  0: '',
  1: 'Bronce',
  2: 'Plata',
  3: 'Oro',
  4: 'Diamante',
};

/** XP awarded per session grade (singleplayer lessons only). */
export function masteryXpForGrade(grade: string | undefined): number {
  if (!grade) return 2;
  const rank = gradeRank(grade);
  if (rank >= gradeRank('SS+')) return 25;
  if (rank >= gradeRank('SS')) return 20;
  if (rank >= gradeRank('S+')) return 15;
  if (rank >= gradeRank('S')) return 10;
  if (rank >= gradeRank('A')) return 5;
  if (rank >= gradeRank('B')) return 3;
  return 2;
}

export function masteryTierFromXp(xp: number): MasteryTier {
  if (xp >= MASTERY_TIER_THRESHOLDS.diamond) return 4;
  if (xp >= MASTERY_TIER_THRESHOLDS.gold) return 3;
  if (xp >= MASTERY_TIER_THRESHOLDS.silver) return 2;
  if (xp >= MASTERY_TIER_THRESHOLDS.bronze) return 1;
  return 0;
}

export function masteryTierProgress(xp: number): { current: number; next: number | null } {
  const tier = masteryTierFromXp(xp);
  const thresholds = [0, MASTERY_TIER_THRESHOLDS.bronze, MASTERY_TIER_THRESHOLDS.silver, MASTERY_TIER_THRESHOLDS.gold, MASTERY_TIER_THRESHOLDS.diamond];
  const currentFloor = thresholds[tier];
  const nextCeiling = tier < 4 ? thresholds[tier + 1] : null;
  return {
    current: xp - currentFloor,
    next: nextCeiling != null ? nextCeiling - currentFloor : null,
  };
}

export const MASTERY_RING_CLASSES: Record<MasteryTier, string> = {
  0: '',
  1: 'ring-2 ring-orange-700/35 shadow-[0_0_12px_rgba(194,65,12,0.12)]',
  2: 'ring-2 ring-slate-400/35 shadow-[0_0_12px_rgba(148,163,184,0.12)]',
  3: 'ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
  4: 'ring-2 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
};

export const MASTERY_BADGE_CLASSES: Record<MasteryTier, string> = {
  0: '',
  1: 'text-orange-400',
  2: 'text-slate-300',
  3: 'text-amber-400',
  4: 'text-cyan-400',
};
