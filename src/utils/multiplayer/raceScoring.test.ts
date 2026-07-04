import { describe, expect, it } from 'vitest';
import { calculateMaxScore } from './raceScoring';

describe('calculateMaxScore', () => {
  it('weights accuracy into WPM and adds combo bonus', () => {
    expect(calculateMaxScore(80, 100, 20)).toBe(900);
    expect(calculateMaxScore(80, 50, 20)).toBe(500);
    expect(calculateMaxScore(80, 100, 0)).toBe(800);
  });

  it('clamps invalid inputs', () => {
    expect(calculateMaxScore(-10, 120, -5)).toBe(0);
  });
});
