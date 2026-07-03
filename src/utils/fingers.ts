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
 * Reference: standard touch-typing charts (powertyping.com, home-row column reach).
 *
 * Home row: a(LP) o(LR) e(LM) u(LI) i(LI) | d(RI) h(RI) t(RM) n(RR) s(RP)
 */
export const KEY_FINGERS: Record<string, Finger> = {
  // ── Left pinky (column 1) ──
  Backquote: 'lp',
  Digit1: 'lp',
  Digit2: 'lp',
  Quote: 'lp',
  Semicolon: 'lp',
  KeyA: 'lp',
  KeyZ: 'lp',
  BracketLeft: 'lp',
  BracketRight: 'lp',

  // ── Left ring (column 2) ──
  Digit3: 'lr',
  Comma: 'lr',
  KeyO: 'lr',
  KeyQ: 'lr',

  // ── Left middle (column 3) ──
  Digit4: 'lm',
  Period: 'lm',
  KeyE: 'lm',
  KeyJ: 'lm',

  // ── Left index (columns 4–5) ──
  Digit5: 'li',
  Digit6: 'li',
  KeyU: 'li',
  KeyI: 'li',
  KeyP: 'li',
  KeyY: 'li',
  KeyF: 'li',
  KeyK: 'li',
  KeyX: 'li',

  // ── Right index (columns 6–7) ──
  Digit7: 'ri',
  KeyD: 'ri',
  KeyH: 'ri',
  KeyG: 'ri',
  KeyB: 'ri',
  KeyM: 'ri',

  // ── Right middle (column 8) ──
  Digit8: 'rm',
  Digit0: 'rm',
  KeyT: 'rm',
  KeyC: 'rm',
  KeyW: 'rm',

  // ── Right ring (column 9) ──
  Digit9: 'rr',
  KeyN: 'rr',
  KeyR: 'rr',
  KeyV: 'rr',

  // ── Right pinky (columns 10–11) ──
  KeyS: 'rp',
  KeyL: 'rp',
  Minus: 'rp',
  Slash: 'rp',
  Equal: 'rp',
  Space: 'rp',
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
