export type Finger = 'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp';

export const FINGER_CSS_VAR: Record<Finger, string> = {
  lp: '--finger-lp',
  lr: '--finger-lr',
  lm: '--finger-lm',
  li: '--finger-li',
  ri: '--finger-ri',
  rm: '--finger-rm',
  rr: '--finger-rr',
  rp: '--finger-rp',
};

export const LEFT_FINGERS: Finger[] = ['lp', 'lr', 'lm', 'li'];
export const RIGHT_FINGERS: Finger[] = ['ri', 'rm', 'rr', 'rp'];

/**
 * Dvorak Simplified Keyboard — finger map by vertical column.
 *
 * Home row: a(LP) o(LR) e(LM) u(LI) i(LI) | d(RI) h(RI) t(RM) n(RR) s(RP)
 * Space is pressed with the thumb — not mapped to a finger.
 */
export const KEY_FINGERS: Record<string, Finger> = {
  // Column 1 — left pinky
  Backquote: 'lp',
  Digit1: 'lp',
  Quote: 'lp',
  KeyA: 'lp',
  Semicolon: 'lp',

  // Column 2 — left ring
  Digit2: 'lr',
  Comma: 'lr',
  KeyO: 'lr',
  KeyQ: 'lr',

  // Column 3 — left middle
  Digit3: 'lm',
  Period: 'lm',
  KeyE: 'lm',
  KeyJ: 'lm',

  // Column 4 — left index
  Digit4: 'li',
  KeyP: 'li',
  KeyU: 'li',
  KeyK: 'li',

  // Column 5 — left index
  Digit5: 'li',
  KeyY: 'li',
  KeyI: 'li',
  KeyX: 'li',

  // Columns 6–7 — right index
  Digit6: 'ri',
  KeyF: 'ri',
  KeyD: 'ri',
  KeyB: 'ri',
  Digit7: 'ri',
  KeyG: 'ri',
  KeyH: 'ri',
  KeyM: 'ri',

  // Column 8 — right middle
  Digit8: 'rm',
  KeyC: 'rm',
  KeyT: 'rm',
  KeyW: 'rm',

  // Column 9 — right ring
  Digit9: 'rr',
  KeyR: 'rr',
  KeyN: 'rr',
  KeyV: 'rr',

  // Column 10 — right pinky
  Digit0: 'rp',
  KeyL: 'rp',
  KeyS: 'rp',
  KeyZ: 'rp',

  // Columns 11–12 — right pinky
  BracketLeft: 'rp',
  BracketRight: 'rp',
  Slash: 'rp',
  Minus: 'rp',
  Equal: 'rp',
  'Modifier:Shift': 'lp',
  'Modifier:Alt': 'lp',
};

export function getFingerForKey(code: string): Finger | undefined {
  return KEY_FINGERS[code];
}

export function isLeftFinger(finger: Finger): boolean {
  return LEFT_FINGERS.includes(finger);
}

/** Home-row finger assignments used in tests and docs. */
export const HOME_ROW_FINGERS: Record<string, Finger> = {
  KeyA: 'lp',
  KeyO: 'lr',
  KeyE: 'lm',
  KeyU: 'li',
  KeyI: 'li',
  KeyD: 'ri',
  KeyH: 'ri',
  KeyT: 'rm',
  KeyN: 'rr',
  KeyS: 'rp',
};
