import { describe, expect, it } from 'vitest';
import {
  calculateStableRaceWpm,
  calculateRaceAccuracy,
  comboMultiplier,
  mergePeakRaceProgress,
  resolveRaceCountdownSeconds,
  scoreIncrementForHit,
} from '@/utils/multiplayer/raceScoring';

describe('raceScoring', () => {
  it('stable WPM requires minimum elapsed time and characters', () => {
    expect(calculateStableRaceWpm(1, 50)).toBe(0);
    expect(calculateStableRaceWpm(8, 500)).toBe(0);
    expect(calculateStableRaceWpm(10, 3_000)).toBeGreaterThan(0);
    expect(calculateStableRaceWpm(10, 3_000)).toBeLessThan(200);
  });

  it('race accuracy counts cumulative errors even after backspace fixes', () => {
    expect(calculateRaceAccuracy(50, 0)).toBe(100);
    expect(calculateRaceAccuracy(50, 5)).toBe(91);
    expect(calculateRaceAccuracy(10, 10)).toBe(50);
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

  it('never decreases peak score, wpm, or percentage but tracks latest accuracy', () => {
    expect(mergePeakRaceProgress(undefined, { wpm: 60, score: 400, percentage: 40 })).toEqual({
      wpm: 60,
      score: 400,
      percentage: 40,
      maxCombo: 0,
      accuracy: 100,
    });
    expect(
      mergePeakRaceProgress(
        { wpm: 60, score: 400, percentage: 55, maxCombo: 10, accuracy: 100 },
        { wpm: 30, score: 200, percentage: 20, maxCombo: 4, accuracy: 90 },
      ),
    ).toEqual({
      wpm: 60,
      score: 400,
      percentage: 55,
      maxCombo: 10,
      // Corrected keystrokes must be able to pull accuracy down from its early 100%.
      accuracy: 90,
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
