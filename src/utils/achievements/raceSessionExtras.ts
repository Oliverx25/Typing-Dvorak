import type { LastSessionSnapshot } from './achievementEvaluator';

let pending: Partial<LastSessionSnapshot> | null = null;

/** Stores per-race session metrics until the results screen evaluates achievements. */
export function setRaceSessionExtras(extras: Partial<LastSessionSnapshot>): void {
  pending = extras;
}

export function consumeRaceSessionExtras(): Partial<LastSessionSnapshot> {
  const value = pending ?? {};
  pending = null;
  return value;
}

export function clearRaceSessionExtras(): void {
  pending = null;
}
