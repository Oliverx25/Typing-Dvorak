import { describe, expect, it } from 'vitest';
import { calculateWpm, calculateAccuracy, calculateTestWpm, buildStats } from './typing';

describe('typing', () => {
  it('calculates WPM from correct chars and elapsed time', () => {
    expect(calculateWpm(50, 60_000)).toBe(10);
    expect(calculateWpm(0, 60_000)).toBe(0);
    expect(calculateWpm(50, 0)).toBe(0);
  });

  it('calculates accuracy', () => {
    expect(calculateAccuracy(90, 10)).toBe(90);
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it('applies error penalty in test mode WPM', () => {
    const withErrors = calculateTestWpm(50, 5, 60_000);
    const noErrors = calculateTestWpm(50, 0, 60_000);
    expect(withErrors).toBeLessThan(noErrors);
  });

  it('builds complete stats object', () => {
    const stats = buildStats(40, 2, 30_000, false);
    expect(stats.wpm).toBeGreaterThan(0);
    expect(stats.accuracy).toBe(95);
    expect(stats.elapsedSeconds).toBe(30);
  });
});
