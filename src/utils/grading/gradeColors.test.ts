import { describe, expect, it } from 'vitest';
import { getGradeColorClasses, getGradeBadgeClassName } from '@/utils/grading/gradeColors';

describe('getGradeColorClasses', () => {
  it('maps top grades to fuchsia and amber families', () => {
    expect(getGradeColorClasses('SS+').bg).toContain('fuchsia');
    expect(getGradeColorClasses('S').bg).toContain('amber');
    expect(getGradeColorClasses('A').bg).toContain('emerald');
  });

  it('falls back for unknown grades', () => {
    expect(getGradeColorClasses('?').bg).toContain('slate');
  });
});

describe('getGradeBadgeClassName', () => {
  it('returns badge classes for each tier', () => {
    expect(getGradeBadgeClassName('A')).toContain('emerald');
    expect(getGradeBadgeClassName('SS+')).toContain('fuchsia');
  });
});
