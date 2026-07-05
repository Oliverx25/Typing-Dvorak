export type Grade = 'SS+' | 'S+' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export const SPECIAL_SS_MULTIPLIER = 1.2;
export const SPECIAL_S_MULTIPLIER = 1.15;

export function normalizeMultiplier(multiplier?: number | null): number {
  if (!Number.isFinite(multiplier ?? 1)) return 1;
  return Math.max(0, multiplier ?? 1);
}

export function baseGradeFromAccuracy(accuracy: number): Exclude<Grade, 'SS+' | 'S+'> {
  if (accuracy >= 99.5) return 'SS';
  if (accuracy >= 98) return 'S';
  if (accuracy >= 95) return 'A';
  if (accuracy >= 90) return 'B';
  if (accuracy >= 80) return 'C';
  if (accuracy >= 70) return 'D';
  return 'F';
}

export function calculateGrade(
  accuracy: number,
  totalMultiplier: number = 1,
): Grade {
  const base = baseGradeFromAccuracy(accuracy);
  const multiplier = normalizeMultiplier(totalMultiplier);

  if (base === 'SS' && multiplier >= SPECIAL_SS_MULTIPLIER) return 'SS+';
  if (base === 'S' && multiplier >= SPECIAL_S_MULTIPLIER) return 'S+';
  return base;
}

export function gradeRank(grade: string | null | undefined): number {
  switch (grade) {
    case 'SS+':
      return 8;
    case 'S+':
      return 7;
    case 'SS':
      return 6;
    case 'S':
      return 5;
    case 'A':
      return 4;
    case 'B':
      return 3;
    case 'C':
      return 2;
    case 'D':
      return 1;
    case 'F':
      return 0;
    default:
      return -1;
  }
}

export function isGradeAtLeast(
  grade: string | null | undefined,
  minimum: Grade,
): boolean {
  return gradeRank(grade) >= gradeRank(minimum);
}

export function bestGrade(
  current: string | null | undefined,
  candidate: string | null | undefined,
): string | null {
  if (!candidate) return current ?? null;
  if (!current) return candidate;
  return gradeRank(candidate) > gradeRank(current) ? candidate : current;
}

export function gradeRingClass(grade: string): string {
  switch (grade) {
    case 'SS+':
      return 'from-indigo-300 via-purple-300 to-pink-300';
    case 'S+':
      return 'from-yellow-300 to-amber-500';
    case 'SS':
      return 'from-slate-200 via-white to-slate-300';
    case 'S':
      return 'from-yellow-300 via-yellow-400 to-amber-500';
    case 'A':
      return 'from-emerald-400 via-emerald-500 to-green-600';
    case 'B':
      return 'from-sky-400 via-blue-500 to-blue-600';
    case 'C':
      return 'from-purple-400 via-purple-500 to-violet-600';
    default:
      return 'from-slate-500 via-slate-600 to-slate-700';
  }
}

const PROGRESS_GRADE_ORDER: Grade[] = ['F', 'D', 'C', 'B', 'A', 'S', 'SS'];

/** Grade shown while the score ring animates (steps F → SS/SS+). */
export function gradeAtScoreProgress(
  progress: number,
  finalGrade: Grade,
  totalMultiplier: number = 1,
): Grade {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped >= 1) return finalGrade;

  const finalRank = gradeRank(finalGrade);
  const maxSteps = PROGRESS_GRADE_ORDER.length;
  const step = Math.min(finalRank, Math.floor(clamped * maxSteps));
  const base = PROGRESS_GRADE_ORDER[step] ?? 'F';

  if (base === 'SS' && totalMultiplier >= SPECIAL_SS_MULTIPLIER && step >= maxSteps - 1) {
    return 'SS+';
  }
  if (base === 'S' && totalMultiplier >= SPECIAL_S_MULTIPLIER && step >= maxSteps - 2) {
    return 'S+';
  }
  return base;
}
