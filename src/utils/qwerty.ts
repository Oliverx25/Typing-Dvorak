/** QWERTY home + common letter positions for educational comparison. */
export const QWERTY_POSITIONS: Record<string, string> = {
  a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h',
  i: 'i', j: 'j', k: 'k', l: 'l', m: 'm', n: 'n', o: 'o', p: 'p',
  q: 'q', r: 'r', s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'x',
  y: 'y', z: 'z',
};

export const DVORAK_POSITIONS: Record<string, string> = {
  a: 'a', b: 'x', c: 'j', d: 'h', e: 'o', f: 'y', g: 'g', h: 'c',
  i: 'u', j: 'q', k: 'k', l: 'r', m: 'w', n: 't', o: 's', p: 'l',
  q: "'", r: 'p', s: 'n', t: 'e', u: 'i', v: 'k', w: 'm', x: 'b',
  y: 'f', z: ';',
};

export const COMPARISON_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function isSamePosition(letter: string): boolean {
  return QWERTY_POSITIONS[letter] === DVORAK_POSITIONS[letter];
}
