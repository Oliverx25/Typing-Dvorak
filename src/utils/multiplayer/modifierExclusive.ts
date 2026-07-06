import type { RaceModifier } from '@/utils/multiplayer/roomConfig.types';

export const MODIFIER_EXCLUSIVE_PAIRS: ReadonlyArray<readonly [RaceModifier, RaceModifier]> = [
  ['double_time', 'half_time'],
  ['flashlight', 'hidden'],
];

const MODIFIER_EXCLUSIVE_OF: Partial<Record<RaceModifier, RaceModifier[]>> = {
  double_time: ['half_time'],
  half_time: ['double_time'],
  flashlight: ['hidden'],
  hidden: ['flashlight'],
};

/** Removes conflicting pairs, keeping the modifier that appears last in the array. */
export function resolveModifierConflicts(modifiers: RaceModifier[]): RaceModifier[] {
  let result = [...modifiers];

  for (const [a, b] of MODIFIER_EXCLUSIVE_PAIRS) {
    if (!result.includes(a) || !result.includes(b)) continue;
    const drop = result.lastIndexOf(a) > result.lastIndexOf(b) ? b : a;
    result = result.filter((mod) => mod !== drop);
  }

  return result;
}

/** Toggle a modifier, auto-deselecting any mutually exclusive active mods. */
export function toggleRaceModifier(
  current: RaceModifier[],
  modifier: RaceModifier,
): RaceModifier[] {
  if (current.includes(modifier)) {
    return current.filter((mod) => mod !== modifier);
  }

  const conflicts = MODIFIER_EXCLUSIVE_OF[modifier] ?? [];
  return resolveModifierConflicts([...current.filter((mod) => !conflicts.includes(mod)), modifier]);
}
