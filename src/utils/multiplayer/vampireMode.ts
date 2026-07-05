/** Starting HP when vampire modifier is active. */
export const VAMPIRE_MAX_HP = 100;

/** HP lost per typing mistake. */
export const VAMPIRE_ERROR_DAMAGE = 14;

/** Passive HP drain per second while the race is active. */
export const VAMPIRE_PASSIVE_DRAIN_PER_SEC = 1.5;

/** Fraction of current race score removed on each mistake. */
export const VAMPIRE_SCORE_DRAIN_RATIO = 0.04;

export function clampVampireHp(value: number): number {
  return Math.max(0, Math.min(VAMPIRE_MAX_HP, value));
}

export function applyVampireErrorDamage(currentHp: number): number {
  return clampVampireHp(currentHp - VAMPIRE_ERROR_DAMAGE);
}

export function applyVampirePassiveDrain(currentHp: number, elapsedMs: number): number {
  const drain = (elapsedMs / 1000) * VAMPIRE_PASSIVE_DRAIN_PER_SEC;
  return clampVampireHp(currentHp - drain);
}

export function applyVampireScoreDrain(currentScore: number): number {
  return Math.max(0, Math.round(currentScore * (1 - VAMPIRE_SCORE_DRAIN_RATIO)));
}

export function vampireHpPercent(hp: number): number {
  return clampVampireHp(hp);
}
