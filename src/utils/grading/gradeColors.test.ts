import { describe, expect, it } from 'vitest';
import {
  getGradeColorClasses,
  getGradeBadgeClassName,
  getWpmBarWidthStyle,
  WPM_BAR_METRICS_RESERVE_PX,
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

describe('getWpmBarWidthStyle', () => {
  it('reserves space for right-hand metrics', () => {
    expect(getWpmBarWidthStyle(50, 100)).toBe(
      `max(2px, calc((100% - ${WPM_BAR_METRICS_RESERVE_PX}px) * 0.5))`,
    );
    expect(getWpmBarWidthStyle(0, 100)).toBe('0');
  });
});

describe('getGradeBadgeClassName', () => {
  it('returns badge classes aligned to grade palette', () => {
    expect(getGradeBadgeClassName('SS+')).toContain('fuchsia');
    expect(getGradeBadgeClassName('SS')).toContain('slate');
    expect(getGradeBadgeClassName('A')).toContain('emerald');
  });
});
