import { describe, expect, it } from 'vitest';
import {
  isComposedCharacter,
  isDeadKeyPrefix,
  segmentInputGraphemes,
} from '@/utils/typing/hiddenInputComposition';

describe('hiddenInputComposition', () => {
  it('segments precomposed Spanish characters as one grapheme', () => {
    expect(segmentInputGraphemes('á')).toEqual(['á']);
    expect(segmentInputGraphemes('ñ')).toEqual(['ñ']);
    expect(segmentInputGraphemes('Á')).toEqual(['Á']);
  });

  it('detects dead-key accent prefixes', () => {
    expect(isDeadKeyPrefix('´')).toBe(true);
    expect(isDeadKeyPrefix('~')).toBe(true);
    expect(isDeadKeyPrefix('^')).toBe(true);
    expect(isDeadKeyPrefix('¨')).toBe(true);
  });

  it('does not treat finished letters as dead-key prefixes', () => {
    expect(isDeadKeyPrefix('á')).toBe(false);
    expect(isDeadKeyPrefix('ñ')).toBe(false);
    expect(isDeadKeyPrefix('a')).toBe(false);
  });

  it('detects composed characters', () => {
    expect(isComposedCharacter('á')).toBe(true);
    expect(isComposedCharacter('Ñ')).toBe(true);
    expect(isComposedCharacter('´')).toBe(false);
  });
});
