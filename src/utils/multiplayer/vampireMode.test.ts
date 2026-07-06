import { describe, expect, it } from 'vitest';
import {
  VAMPIRE_MAX_HP,
  applyVampireErrorDamage,
  applyVampireHeal,
  applyVampireScoreDrain,
  clampVampireHp,
  vampireErrorDamage,
} from '@/utils/multiplayer/vampireMode';

describe('vampireMode', () => {
  it('clamps HP between 0 and max', () => {
    expect(clampVampireHp(120)).toBe(VAMPIRE_MAX_HP);
    expect(clampVampireHp(-5)).toBe(0);
  });

  it('increases damage on consecutive misses', () => {
    expect(vampireErrorDamage(1)).toBeLessThan(vampireErrorDamage(3));
    expect(applyVampireErrorDamage(100, 1)).toBeGreaterThan(applyVampireErrorDamage(100, 3));
  });

  it('heals HP on correct hits with combo bonus', () => {
    expect(applyVampireHeal(50, 1)).toBeGreaterThan(50);
    expect(applyVampireHeal(50, 40)).toBeGreaterThan(applyVampireHeal(50, 1));
  });

  it('drains race score on mistakes', () => {
    expect(applyVampireScoreDrain(10_000)).toBeLessThan(10_000);
    expect(applyVampireScoreDrain(0)).toBe(0);
  });
});
