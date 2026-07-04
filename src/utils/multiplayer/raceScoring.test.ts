import { describe, expect, it } from 'vitest';
import { calculateMaxScore, mergePeakRaceProgress } from './raceScoring';

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

describe('mergePeakRaceProgress', () => {
  it('never decreases score or wpm', () => {
    expect(mergePeakRaceProgress(undefined, { wpm: 60, score: 400 })).toEqual({
      wpm: 60,
      score: 400,
    });
    expect(mergePeakRaceProgress({ wpm: 60, score: 400 }, { wpm: 30, score: 200 })).toEqual({
      wpm: 60,
      score: 400,
    });
    expect(mergePeakRaceProgress({ wpm: 60, score: 400 }, { wpm: 70, score: 350 })).toEqual({
      wpm: 70,
      score: 400,
    });
  });
});
