export interface GradeColorClasses {
  /** Accent text (e.g. WPM value). */
  text: string;
  /** Right-edge glow on the muted WPM bar. */
  border: string;
}

const DEFAULT_GRADE_COLORS: GradeColorClasses = {
  text: 'text-slate-400',
  border: 'border-r-slate-500 shadow-[2px_0_8px_rgba(100,116,139,0.35)]',
};

const GRADE_COLORS: Record<string, GradeColorClasses> = {
  'SS+': {
    text: 'text-fuchsia-400',
    border: 'border-r-fuchsia-400 shadow-[2px_0_8px_rgba(232,121,249,0.4)]',
  },
  SS: {
    text: 'text-slate-200',
    border: 'border-r-slate-300 shadow-[2px_0_8px_rgba(203,213,225,0.4)]',
  },
  'S+': {
    text: 'text-amber-400',
    border: 'border-r-amber-400 shadow-[2px_0_8px_rgba(251,191,36,0.4)]',
  },
  S: {
    text: 'text-amber-400',
    border: 'border-r-amber-400 shadow-[2px_0_8px_rgba(251,191,36,0.4)]',
  },
  A: {
    text: 'text-emerald-400',
    border: 'border-r-emerald-400 shadow-[2px_0_8px_rgba(52,211,153,0.4)]',
  },
  B: {
    text: 'text-blue-400',
    border: 'border-r-blue-400 shadow-[2px_0_8px_rgba(96,165,250,0.35)]',
  },
  C: {
    text: 'text-purple-400',
    border: 'border-r-purple-400 shadow-[2px_0_8px_rgba(192,132,252,0.35)]',
  },
  D: DEFAULT_GRADE_COLORS,
  F: DEFAULT_GRADE_COLORS,
};

/** Grade-tinted text and bar-edge glow — shared with GradeBadge palette. */
export function getGradeColorClasses(grade: string | null | undefined): GradeColorClasses {
  if (!grade) return DEFAULT_GRADE_COLORS;
  return GRADE_COLORS[grade] ?? DEFAULT_GRADE_COLORS;
}

/** Small inline WPM bar fill — safe to use inside the metric column only. */
export function getGradeMicroBarClassName(grade: string | null | undefined): string {
  switch (grade) {
    case 'SS+':
      return 'bg-fuchsia-400';
    case 'SS':
      return 'bg-slate-300';
    case 'S+':
    case 'S':
      return 'bg-amber-400';
    case 'A':
      return 'bg-emerald-400';
    case 'B':
      return 'bg-blue-400';
    case 'C':
      return 'bg-purple-400';
    default:
      return 'bg-slate-400';
  }
}

/** Solid badge surface classes — shared with GradeBadge. */
export function getGradeBadgeClassName(grade: string): string {
  switch (grade) {
    case 'SS+':
      return 'w-auto gap-1 bg-gradient-to-br from-fuchsia-400 via-fuchsia-500 to-pink-500 px-2 font-black text-white shadow-[0_0_12px_rgba(217,70,239,0.55)]';
    case 'S+':
      return 'w-auto gap-1 bg-gradient-to-br from-yellow-300 to-amber-500 px-2 font-bold text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.6)]';
    case 'SS':
      return 'bg-gradient-to-br from-slate-200 to-slate-300 font-black text-slate-900 shadow-[0_0_8px_rgba(203,213,225,0.55)] dark:from-slate-300 dark:to-slate-400';
    case 'S':
      return 'bg-amber-400 font-bold text-amber-950 shadow-[0_0_6px_rgba(251,191,36,0.45)]';
    case 'A':
      return 'bg-emerald-500 font-bold text-white shadow-[0_0_6px_rgba(52,211,153,0.35)]';
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
