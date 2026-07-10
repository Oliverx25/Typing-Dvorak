export interface GradeColorClasses {
  /** Low-opacity fill for WPM bars. */
  bg: string;
  /** Right edge marker on the WPM bar. */
  border: string;
  /** Accent text (e.g. WPM value). */
  text: string;
}

const DEFAULT_BAR_COLORS: GradeColorClasses = {
  bg: 'bg-slate-500/10',
  border: 'border-r-slate-500/50',
  text: 'text-slate-400',
};

const GRADE_BAR_COLORS: Record<string, GradeColorClasses> = {
  'SS+': {
    bg: 'bg-fuchsia-500/10',
    border: 'border-r-fuchsia-500/50',
    text: 'text-fuchsia-400',
  },
  SS: {
    bg: 'bg-fuchsia-500/10',
    border: 'border-r-fuchsia-400/40',
    text: 'text-fuchsia-300',
  },
  'S+': {
    bg: 'bg-amber-500/10',
    border: 'border-r-amber-500/50',
    text: 'text-amber-400',
  },
  S: {
    bg: 'bg-amber-500/10',
    border: 'border-r-amber-400/50',
    text: 'text-amber-400',
  },
  A: {
    bg: 'bg-emerald-500/10',
    border: 'border-r-emerald-500/50',
    text: 'text-emerald-400',
  },
  B: {
    bg: 'bg-blue-500/10',
    border: 'border-r-blue-500/50',
    text: 'text-blue-400',
  },
  C: {
    bg: 'bg-purple-500/10',
    border: 'border-r-purple-500/50',
    text: 'text-purple-400',
  },
  D: DEFAULT_BAR_COLORS,
  F: DEFAULT_BAR_COLORS,
};

/** Tailwind classes for grade-tinted WPM bars and stat accents. */
export function getGradeColorClasses(grade: string | null | undefined): GradeColorClasses {
  if (!grade) return DEFAULT_BAR_COLORS;
  return GRADE_BAR_COLORS[grade] ?? DEFAULT_BAR_COLORS;
}

/** Solid badge surface classes — shared with GradeBadge. */
export function getGradeBadgeClassName(grade: string): string {
  switch (grade) {
    case 'SS+':
      return 'w-auto gap-1 bg-gradient-to-br from-fuchsia-300 via-purple-300 to-pink-300 px-2 font-black text-slate-900 shadow-[0_0_15px_rgba(217,70,239,0.45)]';
    case 'S+':
      return 'w-auto gap-1 bg-gradient-to-br from-yellow-300 to-amber-500 px-2 font-bold text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.6)]';
    case 'SS':
      return 'bg-slate-200 font-black text-slate-900 shadow-[0_0_8px_rgba(226,232,240,0.6)] dark:bg-slate-300';
    case 'S':
      return 'bg-yellow-400 font-bold text-yellow-950';
    case 'A':
      return 'bg-emerald-500 font-bold text-white';
    case 'B':
      return 'bg-blue-500 font-bold text-white';
    case 'C':
      return 'bg-purple-500 font-semibold text-white';
    case 'D':
    case 'F':
      return 'bg-slate-700 font-semibold text-slate-400';
    default:
      return 'bg-slate-700 font-semibold text-slate-400';
  }
}
