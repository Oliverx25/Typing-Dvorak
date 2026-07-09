import { charToKeyCode } from '@/utils/keyboard/dvorak';

/** Modifier pseudo-codes rendered on the virtual keyboard. */
export const MODIFIER_SHIFT = 'Modifier:Shift';
export const MODIFIER_ALT = 'Modifier:Alt';

export interface ModifierKeyDef {
  label: string;
  code: string;
  width?: number;
}

/** Bottom-row modifier keys shown for composite character guidance (macOS Option / Shift). */
export const MODIFIER_ROW: ModifierKeyDef[] = [
  { label: '⇧', code: MODIFIER_SHIFT, width: 2 },
  { label: '⌥', code: MODIFIER_ALT, width: 1.5 },
];

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
]);

/**
 * Maps a typed character to the physical / modifier keys pressed on macOS Dvorak (US).
 * Accents: Option+e (acute dead key) + vowel. Ñ: Option+n + n.
 */
export const compositeKeyMap: Record<string, string[]> = {
  á: [MODIFIER_ALT, 'KeyE', 'KeyA'],
  é: [MODIFIER_ALT, 'KeyE', 'KeyE'],
  í: [MODIFIER_ALT, 'KeyE', 'KeyI'],
  ó: [MODIFIER_ALT, 'KeyE', 'KeyO'],
  ú: [MODIFIER_ALT, 'KeyE', 'KeyU'],
  Á: [MODIFIER_SHIFT, MODIFIER_ALT, 'KeyE', 'KeyA'],
  É: [MODIFIER_SHIFT, MODIFIER_ALT, 'KeyE', 'KeyE'],
  Í: [MODIFIER_SHIFT, MODIFIER_ALT, 'KeyE', 'KeyI'],
  Ó: [MODIFIER_SHIFT, MODIFIER_ALT, 'KeyE', 'KeyO'],
  Ú: [MODIFIER_SHIFT, MODIFIER_ALT, 'KeyE', 'KeyU'],
  ñ: [MODIFIER_ALT, 'KeyN', 'KeyN'],
  Ñ: [MODIFIER_SHIFT, MODIFIER_ALT, 'KeyN', 'KeyN'],
  '¿': [MODIFIER_SHIFT, 'Slash'],
  '¡': [MODIFIER_ALT, 'Digit1'],
};

export function isModifierCode(code: string): boolean {
  return code.startsWith('Modifier:');
}

export function getCompositeKeySequence(char: string): string[] | undefined {
  return compositeKeyMap[char];
}

/** All virtual-key codes to highlight for the next character. */
export function getTargetKeysForChar(char: string): string[] {
  const composite = getCompositeKeySequence(char);
  if (composite) return composite;
  const code = charToKeyCode(char);
  return code ? [code] : [];
}

/** Last physical (non-modifier) key in a composite sequence — used for finger guide & pulse. */
export function getBasePhysicalKeyForChar(char: string): string | undefined {
  const composite = getCompositeKeySequence(char);
  if (composite) {
    for (let i = composite.length - 1; i >= 0; i--) {
      if (!isModifierCode(composite[i])) return composite[i];
    }
    return undefined;
  }
  return charToKeyCode(char);
}

/** Resolves the key code to pulse after a keystroke. */
export function resolvePulseKeyCode(char: string): string | undefined {
  return getBasePhysicalKeyForChar(char) ?? charToKeyCode(char);
}
