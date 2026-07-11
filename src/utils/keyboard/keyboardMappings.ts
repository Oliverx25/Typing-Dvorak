import { charToKeyCode } from '@/utils/keyboard/dvorak';
import { getFingerForKey, isLeftFinger } from '@/utils/keyboard/fingers';

export const SHIFT_LEFT = 'ShiftLeft';
export const SHIFT_RIGHT = 'ShiftRight';
export const ALT_LEFT = 'AltLeft';
export const ALT_RIGHT = 'AltRight';

export const THUMB_KEY_CODES = new Set<string>([ALT_LEFT, ALT_RIGHT, 'Space']);

/** Keys the typing engine should ignore — only the resolved character is evaluated. */
export const IGNORED_TYPING_KEYS = new Set([
  'Dead',
  'Shift',
  'Alt',
  'AltGraph',
  'Control',
  'Meta',
  'CapsLock',
  'Unidentified',
  'Option',
  'Process',
]);

/** Visible dead-key prefixes before the final composed character (Option+e → ´, etc.). */
export const DEAD_KEY_PREFIX_CHARS = new Set(['´', '^', '¨', '~']);

const PURE_MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph']);

/** Whether a keydown should be ignored while composing or during dead-key prefix input. */
export function shouldIgnoreTypingKeyEvent(
  e: Pick<KeyboardEvent, 'key' | 'isComposing'>,
): boolean {
  if (e.isComposing) return true;
  if (IGNORED_TYPING_KEYS.has(e.key)) return true;
  if (PURE_MODIFIER_KEYS.has(e.key)) return true;
  if (DEAD_KEY_PREFIX_CHARS.has(e.key)) return true;
  if (e.key.length === 1 && /\p{M}/u.test(e.key)) return true;
  return false;
}

const ACCENT_VOWELS: Record<string, string> = {
  á: 'KeyA',
  é: 'KeyE',
  í: 'KeyI',
  ó: 'KeyO',
  ú: 'KeyU',
  Á: 'KeyA',
  É: 'KeyE',
  Í: 'KeyI',
  Ó: 'KeyO',
  Ú: 'KeyU',
};

/** Shift on the hand opposite the main key (touch-typing convention). */
export function getOppositeShiftKey(physicalKey: string): string {
  const finger = getFingerForKey(physicalKey);
  if (!finger) return SHIFT_RIGHT;
  return isLeftFinger(finger) ? SHIFT_RIGHT : SHIFT_LEFT;
}

export function isModifierCode(code: string): boolean {
  return (
    code === SHIFT_LEFT ||
    code === SHIFT_RIGHT ||
    code === ALT_LEFT ||
    code === ALT_RIGHT
  );
}

export function isThumbKey(code: string): boolean {
  return THUMB_KEY_CODES.has(code);
}

function accentSteps(vowelCode: string, upper: boolean): string[][] {
  const shift = getOppositeShiftKey(vowelCode);
  if (upper) {
    return [
      [shift, ALT_LEFT, 'KeyE'],
      [shift, vowelCode],
    ];
  }
  return [
    [ALT_LEFT, 'KeyE'],
    [vowelCode],
  ];
}

/**
 * Multi-step key sequences for composite characters (macOS Dvorak US).
 * Each step highlights only the keys pressed in that phase.
 */
export const compositeSequences: Record<string, string[][]> = (() => {
  const map: Record<string, string[][]> = {};

  for (const [char, code] of Object.entries(ACCENT_VOWELS)) {
    const upper = char !== char.toLowerCase();
    map[char] = accentSteps(code, upper);
  }

  map.ñ = [[ALT_LEFT, 'KeyN'], ['KeyN']];
  map.Ñ = [
    [getOppositeShiftKey('KeyN'), ALT_LEFT, 'KeyN'],
    [getOppositeShiftKey('KeyN'), 'KeyN'],
  ];
  map['¿'] = [[getOppositeShiftKey('Slash'), 'Slash']];
  map['¡'] = [[ALT_LEFT, 'Digit1']];

  return map;
})();

/** Returns the highlight steps for the expected character. */
export function getSequenceStepsForChar(char: string): string[][] {
  const composite = compositeSequences[char];
  if (composite) return composite;

  const code = charToKeyCode(char);
  if (!code) return [];

  if (char.length === 1 && char >= 'A' && char <= 'Z') {
    return [[getOppositeShiftKey(code), code]];
  }

  if (char.length === 1 && char >= 'a' && char <= 'z') {
    return [[code]];
  }

  const shiftCode = charToKeyCode(char);
  if (shiftCode && char !== char.toLowerCase()) {
    return [[getOppositeShiftKey(shiftCode), shiftCode]];
  }

  return [[code]];
}

/** Keys to highlight for the current sequence step (0-based). */
export function getActiveStepKeys(char: string, step: number): string[] {
  const steps = getSequenceStepsForChar(char);
  if (steps.length === 0) return [];
  const clamped = Math.min(Math.max(step, 0), steps.length - 1);
  return steps[clamped] ?? [];
}

/** Whether the character uses a multi-step composite sequence. */
export function isMultiStepChar(char: string): boolean {
  return getSequenceStepsForChar(char).length > 1;
}

/** Last physical (non-modifier) key — used for finger guide & pulse. */
export function getBasePhysicalKeyForChar(char: string): string | undefined {
  const steps = getSequenceStepsForChar(char);
  if (steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    for (let i = lastStep.length - 1; i >= 0; i--) {
      if (!isModifierCode(lastStep[i])) return lastStep[i];
    }
  }
  return charToKeyCode(char);
}

/** Resolves the key code to pulse after a keystroke. */
export function resolvePulseKeyCode(char: string): string | undefined {
  return getBasePhysicalKeyForChar(char) ?? charToKeyCode(char);
}

/** Physical (non-modifier) keys in a step. */
function physicalKeysInStep(stepKeys: string[]): string[] {
  return stepKeys.filter((key) => !isModifierCode(key));
}

/** Whether a keydown event completes the current visual sequence step. */
export function eventAdvancesCompositeStep(
  e: KeyboardEvent,
  stepKeys: string[],
): boolean {
  if (stepKeys.length === 0) return false;

  const physicalKeys = physicalKeysInStep(stepKeys);
  const needsAlt = stepKeys.includes(ALT_LEFT) || stepKeys.includes(ALT_RIGHT);
  const needsShift = stepKeys.includes(SHIFT_LEFT) || stepKeys.includes(SHIFT_RIGHT);

  // Dead key = accent/tilde prefix resolved (Option+e or Option+n on macOS).
  if (e.key === 'Dead' || e.key === '´' || e.key === '^' || e.key === '¨' || e.key === '~') {
    if (physicalKeys.includes('KeyE') || physicalKeys.includes('KeyN')) return true;
  }

  const isModifierOnlyEvent =
    (IGNORED_TYPING_KEYS.has(e.key) && e.key !== 'Dead') ||
    e.code === SHIFT_LEFT ||
    e.code === SHIFT_RIGHT ||
    e.code === ALT_LEFT ||
    e.code === ALT_RIGHT;

  // Modifier alone never completes a step that also requires a letter/digit key.
  if (isModifierOnlyEvent && physicalKeys.length > 0) {
    return false;
  }

  if (physicalKeys.length === 0) return false;

  if (!physicalKeys.includes(e.code)) return false;

  if (needsAlt && !e.altKey) return false;
  if (needsShift && !e.shiftKey) return false;

  // Second "n" in ñ is typed without Option held.
  if (!needsAlt && physicalKeys.length === 1 && physicalKeys[0] === 'KeyN' && e.altKey) {
    return false;
  }

  return true;
}
