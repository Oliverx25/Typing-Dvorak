import { describe, expect, it } from 'vitest';
import {
  containsDeadKeyPrefix,
  getWordBackspaceCount,
  isDeadKeyActivationKey,
  isDeadKeyPrefix,
  isDuplicateCompositionEcho,
  isWordBackspaceKey,
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
    expect(isDeadKeyActivationKey({ key: 'Backspace', altKey: true } as KeyboardEvent)).toBe(false);
  });

  it('detects pending accent prefixes inside a longer buffer', () => {
    expect(containsDeadKeyPrefix('e´')).toBe(true);
    expect(containsDeadKeyPrefix('acorde')).toBe(false);
  });

  it('detects word-backspace modifier combos', () => {
    expect(
      isWordBackspaceKey({ key: 'Backspace', altKey: true, ctrlKey: false, metaKey: false } as KeyboardEvent),
    ).toBe(true);
    expect(
      isWordBackspaceKey({ key: 'Backspace', altKey: false, ctrlKey: true, metaKey: false } as KeyboardEvent),
    ).toBe(true);
    expect(
      isWordBackspaceKey({ key: 'Backspace', altKey: false, ctrlKey: false, metaKey: false } as KeyboardEvent),
    ).toBe(false);
  });

  it('computes macOS-style word backspace delete counts', () => {
    expect(getWordBackspaceCount('')).toBe(0);
    expect(getWordBackspaceCount('hello world')).toBe(5);
    expect(getWordBackspaceCount('hello ')).toBe(6);
    expect(getWordBackspaceCount('hello  ')).toBe(7);
    expect(getWordBackspaceCount('a')).toBe(1);
  });
});
