import { describe, expect, it } from 'vitest';
import {
  calculateStableRaceWpm,
  comboMultiplier,
  mergePeakRaceProgress,
  resolveRaceCountdownSeconds,
  scoreIncrementForHit,
} from './raceScoring';

describe('raceScoring', () => {
  it('stable WPM requires minimum elapsed time and characters', () => {
    expect(calculateStableRaceWpm(1, 50)).toBe(0);
    expect(calculateStableRaceWpm(8, 500)).toBe(0);
    expect(calculateStableRaceWpm(10, 3_000)).toBeGreaterThan(0);
    expect(calculateStableRaceWpm(10, 3_000)).toBeLessThan(200);
  });

  it('increases score per hit with combo and accuracy', () => {
    expect(scoreIncrementForHit(1, 100)).toBeGreaterThan(0);
    expect(scoreIncrementForHit(50, 100)).toBeGreaterThan(scoreIncrementForHit(1, 100));
    expect(scoreIncrementForHit(10, 50)).toBeLessThan(scoreIncrementForHit(10, 100));
  });

  it('combo multiplier caps growth', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(300)).toBe(4);
    expect(comboMultiplier(500)).toBe(4);
  });

  it('never decreases peak score or wpm', () => {
    expect(mergePeakRaceProgress(undefined, { wpm: 60, score: 400 })).toEqual({
      wpm: 60,
      score: 400,
    });
    expect(mergePeakRaceProgress({ wpm: 60, score: 400 }, { wpm: 30, score: 200 })).toEqual({
      wpm: 60,
      score: 400,
    });
  });

  it('clamps countdown to the pre-race window', () => {
    const now = Date.now();
    expect(resolveRaceCountdownSeconds(now + 500, now)).toEqual({
      countdownSeconds: 1,
      raceActive: false,
    });
    expect(resolveRaceCountdownSeconds(now + 161_000, now)).toEqual({
      countdownSeconds: 3,
      raceActive: false,
    });
    expect(resolveRaceCountdownSeconds(now - 1, now)).toEqual({
      countdownSeconds: null,
      raceActive: true,
    });
  });
});
