import { describe, expect, it } from 'vitest';
import {
  compositeKeyMap,
  getBasePhysicalKeyForChar,
  getCompositeKeySequence,
  getTargetKeysForChar,
  MODIFIER_ALT,
  MODIFIER_SHIFT,
  resolvePulseKeyCode,
} from '@/utils/keyboard/keyboardMappings';

describe('keyboardMappings', () => {
  it('maps Spanish accented vowels to Option+e sequences', () => {
    expect(getCompositeKeySequence('á')).toEqual([MODIFIER_ALT, 'KeyE', 'KeyA']);
    expect(getCompositeKeySequence('ú')).toEqual([MODIFIER_ALT, 'KeyE', 'KeyU']);
  });

  it('maps uppercase accented vowels with Shift + Option+e', () => {
    expect(getCompositeKeySequence('Í')).toEqual([MODIFIER_SHIFT, MODIFIER_ALT, 'KeyE', 'KeyI']);
  });

  it('maps ñ to Option+n twice', () => {
    expect(getCompositeKeySequence('ñ')).toEqual([MODIFIER_ALT, 'KeyN', 'KeyN']);
    expect(getCompositeKeySequence('Ñ')).toEqual([MODIFIER_SHIFT, MODIFIER_ALT, 'KeyN', 'KeyN']);
  });

  it('falls back to single physical key for ASCII characters', () => {
    expect(getTargetKeysForChar('a')).toEqual(['KeyA']);
    expect(getTargetKeysForChar(' ')).toEqual(['Space']);
  });

  it('returns the base physical key for composite characters', () => {
    expect(getBasePhysicalKeyForChar('á')).toBe('KeyA');
    expect(getBasePhysicalKeyForChar('ñ')).toBe('KeyN');
    expect(getBasePhysicalKeyForChar('¿')).toBe('Slash');
  });

  it('resolves pulse key for composite and plain characters', () => {
    expect(resolvePulseKeyCode('ó')).toBe('KeyO');
    expect(resolvePulseKeyCode('z')).toBe('KeyZ');
  });

  it('covers every Spanish composite character in the catalog', () => {
    const chars = 'áéíóúÁÉÍÓÚÑñ¿¡';
    for (const char of chars) {
      expect(compositeKeyMap[char]?.length).toBeGreaterThan(0);
    }
  });
});
