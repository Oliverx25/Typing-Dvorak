import { describe, expect, it } from 'vitest';
import {
  resolveModifierConflicts,
  toggleRaceModifier,
} from '@/utils/multiplayer/modifierExclusive';

describe('toggleRaceModifier', () => {
  it('activates a modifier when inactive', () => {
    expect(toggleRaceModifier([], 'strict')).toEqual(['strict']);
  });

  it('deactivates a modifier when active', () => {
    expect(toggleRaceModifier(['strict'], 'strict')).toEqual([]);
  });

  it('replaces half_time when activating double_time', () => {
    expect(toggleRaceModifier(['half_time'], 'double_time')).toEqual(['double_time']);
  });

  it('replaces double_time when activating half_time', () => {
    expect(toggleRaceModifier(['double_time'], 'half_time')).toEqual(['half_time']);
  });

  it('replaces hidden when activating flashlight', () => {
    expect(toggleRaceModifier(['hidden', 'strict'], 'flashlight')).toEqual([
      'strict',
      'flashlight',
    ]);
  });

  it('replaces flashlight when activating hidden', () => {
    expect(toggleRaceModifier(['flashlight'], 'hidden')).toEqual(['hidden']);
  });
});

describe('resolveModifierConflicts', () => {
  it('keeps the modifier that appears last in the array', () => {
    expect(resolveModifierConflicts(['double_time', 'half_time'])).toEqual(['half_time']);
    expect(resolveModifierConflicts(['half_time', 'double_time'])).toEqual(['double_time']);
  });
});
