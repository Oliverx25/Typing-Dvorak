import { describe, expect, it } from 'vitest';
import { calculateGrade, isGradeAtLeast } from './grading';

describe('calculateGrade', () => {
  it('maps accuracy to global letter grades', () => {
    expect(calculateGrade(100)).toBe('SS');
    expect(calculateGrade(98)).toBe('S');
    expect(calculateGrade(95)).toBe('A');
    expect(calculateGrade(90)).toBe('B');
    expect(calculateGrade(80)).toBe('C');
    expect(calculateGrade(70)).toBe('D');
    expect(calculateGrade(60)).toBe('F');
  });

  it('unlocks special grades with risk multiplier', () => {
    expect(calculateGrade(100, 1.2)).toBe('SS+');
    expect(calculateGrade(98, 1.15)).toBe('S+');
    expect(calculateGrade(98, 1.1)).toBe('S');
  });
});

describe('isGradeAtLeast', () => {
  it('orders special and normal grades', () => {
    expect(isGradeAtLeast('SS+', 'SS')).toBe(true);
    expect(isGradeAtLeast('A', 'S')).toBe(false);
  });
});
