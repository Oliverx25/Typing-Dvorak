import { describe, expect, it } from 'vitest';
import {
  getGradeColorClasses,
  getGradeBadgeClassName,
  getGradeMicroBarClassName,
} from '@/utils/grading/gradeColors';

describe('getGradeColorClasses', () => {
  it('uses magenta for SS+ and silver for SS', () => {
    expect(getGradeColorClasses('SS+').text).toContain('fuchsia');
    expect(getGradeColorClasses('SS').text).toContain('slate');
    expect(getGradeColorClasses('SS').border).toContain('slate');
  });

  it('falls back for unknown grades', () => {
    expect(getGradeColorClasses('?').text).toContain('slate');
  });
});

describe('getGradeMicroBarClassName', () => {
  it('returns compact fill classes aligned to grade palette', () => {
    expect(getGradeMicroBarClassName('SS+')).toBe('bg-fuchsia-400');
    expect(getGradeMicroBarClassName('SS')).toBe('bg-slate-300');
    expect(getGradeMicroBarClassName('A')).toBe('bg-emerald-400');
  });
});

describe('getGradeBadgeClassName', () => {
  it('returns badge classes aligned to grade palette', () => {
    expect(getGradeBadgeClassName('SS+')).toContain('fuchsia');
    expect(getGradeBadgeClassName('SS')).toContain('slate');
    expect(getGradeBadgeClassName('A')).toContain('emerald');
  });
});
