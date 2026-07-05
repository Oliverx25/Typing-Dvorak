import { describe, expect, it } from 'vitest';
import {
  VAMPIRE_MAX_HP,
  applyVampireErrorDamage,
  applyVampirePassiveDrain,
  applyVampireScoreDrain,
  clampVampireHp,
} from './vampireMode';

describe('vampireMode', () => {
  it('clamps HP between 0 and max', () => {
    expect(clampVampireHp(120)).toBe(VAMPIRE_MAX_HP);
    expect(clampVampireHp(-5)).toBe(0);
  });

  it('drains HP on errors', () => {
    expect(applyVampireErrorDamage(100)).toBeLessThan(100);
    expect(applyVampireErrorDamage(5)).toBe(0);
  });

  it('passively drains HP over time', () => {
    expect(applyVampirePassiveDrain(100, 2000)).toBeLessThan(100);
  });

  it('drains race score on mistakes', () => {
    expect(applyVampireScoreDrain(10_000)).toBeLessThan(10_000);
    expect(applyVampireScoreDrain(0)).toBe(0);
  });
});
