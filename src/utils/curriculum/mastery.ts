import {
  calculateGrade,
  gradeRank,
  SPECIAL_SS_MULTIPLIER,
  type Grade,
} from '@/utils/grading';
import type { PracticeMode } from '@/utils/app/settings';
import type { LessonMasteryPerformance } from '@/utils/progress/lessonProgressAggregate';
import { isMicroLessonId } from '@/utils/curriculum/microLessonCatalog';

/** Cumulative XP thresholds per mastery tier. */
export const MASTERY_TIER_THRESHOLDS = {
  bronze: 150,
  silver: 450,
  gold: 1000,
  diamond: 2000,
  ascended: 3500,
} as const;

export type MasteryTier = 0 | 1 | 2 | 3 | 4 | 5;

export const MASTERY_TIER_LABELS: Record<MasteryTier, string> = {
  0: '',
  1: 'Bronce',
  2: 'Plata',
  3: 'Oro',
  4: 'Diamante',
  5: 'Maestro',
};

export interface MasteryTierRequirements {
  minWpm: number;
  minAccuracy: number;
  minGrade?: Grade;
  /** When true, WPM/accuracy/grade must come from timed test sessions. */
  testMode?: boolean;
}

export const MASTERY_TIER_REQUIREMENTS: Partial<Record<MasteryTier, MasteryTierRequirements>> = {
  3: { minWpm: 40, minAccuracy: 90 },
  4: { minWpm: 50, minAccuracy: 92, testMode: true },
  5: { minWpm: 70, minAccuracy: 96, minGrade: 'S+', testMode: true },
};

const THRESHOLD_LIST = [
  0,
  MASTERY_TIER_THRESHOLDS.bronze,
  MASTERY_TIER_THRESHOLDS.silver,
  MASTERY_TIER_THRESHOLDS.gold,
  MASTERY_TIER_THRESHOLDS.diamond,
  MASTERY_TIER_THRESHOLDS.ascended,
] as const;

/** Grade multiplier used when blind mode is active in singleplayer. */
export function blindModeGradeMultiplier(blindMode: boolean): number {
  return blindMode ? SPECIAL_SS_MULTIPLIER : 1;
}

/** Base XP from letter grade — intentionally low; performance scales the rest. */
export function masteryXpForGrade(grade: string | undefined): number {
  if (!grade) return 1;
  const rank = gradeRank(grade);
  if (rank >= gradeRank('SS+')) return 14;
  if (rank >= gradeRank('SS')) return 11;
  if (rank >= gradeRank('S+')) return 9;
  if (rank >= gradeRank('S')) return 7;
  if (rank >= gradeRank('A')) return 4;
  if (rank >= gradeRank('B')) return 2;
  return 1;
}

export interface MasterySessionInput {
  wpm: number;
  accuracy: number;
  grade?: string;
  isMicroLesson?: boolean;
  mode?: PracticeMode;
}

const TEST_MODE_XP_MULTIPLIER = 1.35;
const PRACTICE_MODE_XP_MULTIPLIER = 1;

/**
 * XP earned per session — requires minimum skill and scales with WPM × accuracy.
 * Test mode awards more XP; micro-lessons award 60% XP.
 */
export function masteryXpForSession(input: MasterySessionInput): number {
  const { wpm, accuracy, grade, isMicroLesson = false, mode = 'practice' } = input;

  if (accuracy < 78 || wpm < 12) return 0;

  const resolvedGrade = grade ?? calculateGrade(accuracy);
  const gradeBase = masteryXpForGrade(resolvedGrade);
  const wpmFactor = Math.min(1.8, 0.35 + wpm / 55);
  const accuracyFactor = Math.min(1.2, accuracy / 100);
  const modeFactor = mode === 'test' ? TEST_MODE_XP_MULTIPLIER : PRACTICE_MODE_XP_MULTIPLIER;
  let xp = Math.round(gradeBase * wpmFactor * accuracyFactor * modeFactor);

  if (isMicroLesson) xp = Math.round(xp * 0.6);

  return Math.max(0, xp);
}

export function masteryTierFromXp(xp: number): MasteryTier {
  if (xp >= MASTERY_TIER_THRESHOLDS.ascended) return 5;
  if (xp >= MASTERY_TIER_THRESHOLDS.diamond) return 4;
  if (xp >= MASTERY_TIER_THRESHOLDS.gold) return 3;
  if (xp >= MASTERY_TIER_THRESHOLDS.silver) return 2;
  if (xp >= MASTERY_TIER_THRESHOLDS.bronze) return 1;
  return 0;
}

function performanceForRequirement(
  req: MasteryTierRequirements,
  perf: LessonMasteryPerformance,
): { wpm: number; accuracy: number; grade: string | null } {
  if (req.testMode) {
    return {
      wpm: perf.testBestWpm,
      accuracy: perf.testBestAccuracy,
      grade: perf.testHighestGrade,
    };
  }
  return {
    wpm: perf.bestWpm,
    accuracy: perf.bestAccuracy,
    grade: perf.highestGrade,
  };
}

export function meetsTierRequirements(
  tier: MasteryTier,
  perf: LessonMasteryPerformance,
): boolean {
  const req = MASTERY_TIER_REQUIREMENTS[tier];
  if (!req) return true;

  const { wpm, accuracy, grade } = performanceForRequirement(req, perf);

  if (req.testMode && perf.testAttempts <= 0) return false;
  if (wpm < req.minWpm) return false;
  if (accuracy < req.minAccuracy) return false;
  if (req.minGrade && gradeRank(grade) < gradeRank(req.minGrade)) return false;
  return true;
}

/** Effective tier — XP tier capped until WPM/accuracy/grade/test requirements are met. */
export function effectiveMasteryTier(
  xp: number,
  perf: LessonMasteryPerformance,
): MasteryTier {
  let tier = masteryTierFromXp(xp);

  while (tier > 0 && !meetsTierRequirements(tier, perf)) {
    tier = (tier - 1) as MasteryTier;
  }

  return tier;
}

export function masteryTierProgress(xp: number): {
  tier: MasteryTier;
  current: number;
  next: number | null;
  xpToNext: number | null;
} {
  const tier = masteryTierFromXp(xp);
  const floor = THRESHOLD_LIST[tier];
  const ceiling = tier < 5 ? THRESHOLD_LIST[tier + 1] : null;
  const span = ceiling != null ? ceiling - floor : null;

  return {
    tier,
    current: xp - floor,
    next: span,
    xpToNext: ceiling != null ? Math.max(0, ceiling - xp) : null,
  };
}

export interface LessonMasterySnapshot {
  masteryXp: number;
  masteryTier: MasteryTier;
  xpProgress: ReturnType<typeof masteryTierProgress>;
  blockedTier: MasteryTier | null;
  blockedRequirements: MasteryTierRequirements | null;
}

export function buildLessonMasterySnapshot(
  xp: number,
  perf: LessonMasteryPerformance,
): LessonMasterySnapshot {
  const xpTier = masteryTierFromXp(xp);
  const masteryTier = effectiveMasteryTier(xp, perf);
  const xpProgress = masteryTierProgress(xp);

  let blockedTier: MasteryTier | null = null;
  let blockedRequirements: MasteryTierRequirements | null = null;

  if (xpTier > masteryTier) {
    blockedTier = xpTier;
    blockedRequirements = MASTERY_TIER_REQUIREMENTS[xpTier] ?? null;
  }

  return {
    masteryXp: xp,
    masteryTier,
    xpProgress,
    blockedTier,
    blockedRequirements,
  };
}

export function isMicroLessonForMastery(lessonId: string): boolean {
  return isMicroLessonId(lessonId);
}

export const MASTERY_RING_CLASSES: Record<MasteryTier, string> = {
  0: '',
  1: 'ring-2 ring-orange-700/35 shadow-[0_0_12px_rgba(194,65,12,0.12)]',
  2: 'ring-2 ring-slate-400/35 shadow-[0_0_12px_rgba(148,163,184,0.12)]',
  3: 'ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
  4: 'ring-2 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
  5: 'ring-2 ring-fuchsia-500/45 shadow-[0_0_18px_rgba(217,70,239,0.2)]',
};

export const MASTERY_BADGE_CLASSES: Record<MasteryTier, string> = {
  0: 'text-[var(--color-text-muted)]',
  1: 'text-orange-400',
  2: 'text-slate-300',
  3: 'text-amber-400',
  4: 'text-cyan-400',
  5: 'text-fuchsia-400',
};
