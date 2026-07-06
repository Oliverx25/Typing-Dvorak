/** Starting HP when vampire modifier is active. */
export const VAMPIRE_MAX_HP = 100;

/** Base HP lost on the first mistake in a streak. */
export const VAMPIRE_BASE_ERROR_DAMAGE = 8;

/** Each consecutive miss multiplies damage (osu!-style). */
export const VAMPIRE_CONSECUTIVE_DAMAGE_SCALE = 1.45;

/** HP restored on each correct keystroke. */
export const VAMPIRE_BASE_HEAL = 1.2;

/** Extra heal scales with combo, capped for balance. */
export const VAMPIRE_COMBO_HEAL_FACTOR = 0.07;

export const VAMPIRE_MAX_COMBO_HEAL = 4;

/** Fraction of current race score removed on each mistake. */
export const VAMPIRE_SCORE_DRAIN_RATIO = 0.04;

export function clampVampireHp(value: number): number {
  return Math.max(0, Math.min(VAMPIRE_MAX_HP, value));
}

/** Damage for the Nth consecutive miss (1-based). */
export function vampireErrorDamage(consecutiveMisses: number): number {
  const streak = Math.max(1, consecutiveMisses);
  return Math.round(
    VAMPIRE_BASE_ERROR_DAMAGE * VAMPIRE_CONSECUTIVE_DAMAGE_SCALE ** (streak - 1),
  );
}

export function applyVampireErrorDamage(currentHp: number, consecutiveMisses: number): number {
  return clampVampireHp(currentHp - vampireErrorDamage(consecutiveMisses));
}

export function applyVampireHeal(currentHp: number, comboAfterHit: number): number {
  const comboBonus = Math.min(
    VAMPIRE_MAX_COMBO_HEAL,
    comboAfterHit * VAMPIRE_COMBO_HEAL_FACTOR,
  );
  return clampVampireHp(currentHp + VAMPIRE_BASE_HEAL + comboBonus);
}

export function applyVampireScoreDrain(currentScore: number): number {
  return Math.max(0, Math.round(currentScore * (1 - VAMPIRE_SCORE_DRAIN_RATIO)));
}

export function vampireHpPercent(hp: number): number {
  return clampVampireHp(hp);
}
