import { describe, expect, it } from 'vitest';
import {
  ALT_LEFT,
  compositeSequences,
  eventAdvancesCompositeStep,
  getActiveStepKeys,
  getBasePhysicalKeyForChar,
  getOppositeShiftKey,
  getSequenceStepsForChar,
  resolvePulseKeyCode,
  SHIFT_RIGHT,
} from '@/utils/keyboard/keyboardMappings';

describe('keyboardMappings', () => {
  it('maps Spanish accented vowels to two-step Option+e sequences', () => {
    expect(getSequenceStepsForChar('á')).toEqual([[ALT_LEFT, 'KeyE'], ['KeyA']]);
    expect(getSequenceStepsForChar('ú')).toEqual([[ALT_LEFT, 'KeyE'], ['KeyU']]);
  });

  it('uses opposite-hand shift for uppercase accented vowels', () => {
    expect(getSequenceStepsForChar('Í')).toEqual([
      [SHIFT_RIGHT, ALT_LEFT, 'KeyE'],
      [SHIFT_RIGHT, 'KeyI'],
    ]);
  });

  it('maps ñ to two-step Option+n sequences', () => {
    expect(getSequenceStepsForChar('ñ')).toEqual([[ALT_LEFT, 'KeyN'], ['KeyN']]);
    expect(getSequenceStepsForChar('Ñ')[0]).toContain(ALT_LEFT);
  });

  it('uses opposite-hand shift for simple uppercase letters', () => {
    expect(getSequenceStepsForChar('A')).toEqual([[SHIFT_RIGHT, 'KeyA']]);
    expect(getSequenceStepsForChar('P')).toEqual([[SHIFT_RIGHT, 'KeyP']]);
  });

  it('returns single-step keys for lowercase ASCII', () => {
    expect(getActiveStepKeys('a', 0)).toEqual(['KeyA']);
    expect(getActiveStepKeys(' ', 0)).toEqual(['Space']);
  });

  it('returns only the active step keys for multi-step characters', () => {
    expect(getActiveStepKeys('á', 0)).toEqual([ALT_LEFT, 'KeyE']);
    expect(getActiveStepKeys('á', 1)).toEqual(['KeyA']);
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

  it('picks opposite-hand shift based on finger column', () => {
    expect(getOppositeShiftKey('KeyA')).toBe(SHIFT_RIGHT);
    expect(getOppositeShiftKey('KeyN')).toBe('ShiftLeft');
  });

  it('advances accent step on Dead key events', () => {
    const deadEvent = { key: 'Dead', code: 'KeyE', altKey: true } as KeyboardEvent;
    expect(eventAdvancesCompositeStep(deadEvent, [ALT_LEFT, 'KeyE'])).toBe(true);
  });

  it('does not advance accent step on Option/Alt alone', () => {
    const altOnly = { key: 'Alt', code: 'AltLeft', altKey: true } as KeyboardEvent;
    expect(eventAdvancesCompositeStep(altOnly, [ALT_LEFT, 'KeyE'])).toBe(false);
  });

  it('advances accent step on Option+e together', () => {
    const optionE = { key: 'Dead', code: 'KeyE', altKey: true } as KeyboardEvent;
    const optionEChar = { key: '´', code: 'KeyE', altKey: true } as KeyboardEvent;
    expect(eventAdvancesCompositeStep(optionE, [ALT_LEFT, 'KeyE'])).toBe(true);
    expect(eventAdvancesCompositeStep(optionEChar, [ALT_LEFT, 'KeyE'])).toBe(true);
  });

  it('does not advance ñ step 2 when Option is still held', () => {
    const optionN = { key: 'n', code: 'KeyN', altKey: true } as KeyboardEvent;
    expect(eventAdvancesCompositeStep(optionN, ['KeyN'])).toBe(false);
  });

  it('covers every Spanish composite character in the catalog', () => {
    const chars = 'áéíóúÁÉÍÓÚÑñ¿¡';
    for (const char of chars) {
      expect(compositeSequences[char]?.length).toBeGreaterThan(0);
    }
  });
});
