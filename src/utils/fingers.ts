export type Finger = 'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp';

/** Finger color tokens — mapped to CSS variables in global.css */
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

/** Standard Dvorak touch-typing finger assignments. */
export const KEY_FINGERS: Record<string, Finger> = {
  Backquote: 'lp', Digit1: 'lp', Digit2: 'lp', Quote: 'lp', Semicolon: 'lp',
  KeyA: 'lp', BracketLeft: 'lp', BracketRight: 'lp', Slash: 'lp', Equal: 'lp',
  Digit3: 'lr', Comma: 'lr', KeyO: 'lr', KeyQ: 'lr', KeyZ: 'lr',
  Digit4: 'lm', Period: 'lm', KeyE: 'lm', KeyJ: 'lm', KeyX: 'lm',
  Digit5: 'li', KeyP: 'li', KeyY: 'li', KeyF: 'li', KeyK: 'li', KeyU: 'li',
  Digit6: 'li', KeyG: 'li', KeyC: 'li',
  Digit7: 'ri', KeyI: 'ri', KeyR: 'ri', KeyL: 'ri', KeyW: 'ri', KeyV: 'ri',
  Digit8: 'ri', KeyT: 'ri', KeyH: 'ri', KeyB: 'ri', KeyM: 'ri',
  Digit9: 'rm', KeyD: 'rm', KeyN: 'rm',
  Digit0: 'rr', KeyS: 'rr',
  Minus: 'rp', KeyH: 'ri',
  Space: 'rp',
};

export function getFingerForKey(code: string): Finger | undefined {
  return KEY_FINGERS[code];
}
