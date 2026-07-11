import { describe, expect, it } from 'vitest';
import {
  isDeadKeyActivationKey,
  isDeadKeyPrefix,
  isDuplicateCompositionEcho,
  segmentInputGraphemes,
  stripCommittedPrefix,
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

  it('detects duplicate composition echo', () => {
    expect(isDuplicateCompositionEcho('á', 'á')).toBe(true);
    expect(isDuplicateCompositionEcho('b', 'á')).toBe(false);
  });

  it('strips committed dead-key prefix from combined input', () => {
    expect(stripCommittedPrefix('á', 'á')).toBeNull();
    expect(stripCommittedPrefix('b', 'á')).toBe('b');
    expect(stripCommittedPrefix('áb', 'á')).toBe('b');
  });

  it('detects dead-key activation keys', () => {
    expect(isDeadKeyActivationKey({ key: 'Alt', altKey: true } as KeyboardEvent)).toBe(true);
    expect(isDeadKeyActivationKey({ key: '´', altKey: false } as KeyboardEvent)).toBe(true);
    expect(isDeadKeyActivationKey({ key: 'a', altKey: false } as KeyboardEvent)).toBe(false);
  });
});
