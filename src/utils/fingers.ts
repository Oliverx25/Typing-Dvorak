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
 * Dvorak touch-typing finger map.
 * Home row: a(LP) o(LR) e(LM) u(LI) i(LI) | d(RI) h(RI) t(RR) n(RM) s(RP)
 */
export const KEY_FINGERS: Record<string, Finger> = {
  Backquote: 'lp', Digit1: 'lp', Digit2: 'lp', Quote: 'lp', Semicolon: 'lp',
  KeyA: 'lp', BracketLeft: 'lp', BracketRight: 'lp', Slash: 'lp', Equal: 'lp', KeyZ: 'lp',
  Digit3: 'lr', Comma: 'lr', KeyO: 'lr', KeyQ: 'lr', KeyR: 'lr',
  Digit4: 'lm', Period: 'lm', KeyE: 'lm', KeyJ: 'lm',
  Digit5: 'li', Digit6: 'li', KeyU: 'li', KeyI: 'li', KeyP: 'li', KeyY: 'li', KeyF: 'li',
  Digit7: 'ri', KeyD: 'ri', KeyH: 'ri', KeyG: 'ri', KeyC: 'ri', KeyL: 'ri', KeyW: 'ri',
  Digit8: 'rm', KeyN: 'rm', KeyM: 'rm', KeyB: 'rm',
  Digit9: 'rr', KeyT: 'rr', KeyK: 'rr', KeyX: 'rr', Digit0: 'rr',
  KeyS: 'rp', Minus: 'rp', KeyV: 'rr', Space: 'rp',
};

export function getFingerForKey(code: string): Finger | undefined {
  return KEY_FINGERS[code];
}

export function isLeftFinger(finger: Finger): boolean {
  return LEFT_FINGERS.includes(finger);
}
