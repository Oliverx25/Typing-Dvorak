export interface KeyDef {
  label: string;
  code: string;
  width?: number;
}

export interface KeyboardRow {
  keys: KeyDef[];
  indent?: number;
}

/** Dvorak Simplified Keyboard layout (US). */
export const DVORAK_ROWS: KeyboardRow[] = [
  {
    keys: [
      { label: '`', code: 'Backquote' },
      { label: '1', code: 'Digit1' },
      { label: '2', code: 'Digit2' },
      { label: '3', code: 'Digit3' },
      { label: '4', code: 'Digit4' },
      { label: '5', code: 'Digit5' },
      { label: '6', code: 'Digit6' },
      { label: '7', code: 'Digit7' },
      { label: '8', code: 'Digit8' },
      { label: '9', code: 'Digit9' },
      { label: '0', code: 'Digit0' },
      { label: '[', code: 'BracketLeft' },
      { label: ']', code: 'BracketRight' },
    ],
  },
  {
    indent: 1,
    keys: [
      { label: "'", code: 'Quote' },
      { label: ',', code: 'Comma' },
      { label: '.', code: 'Period' },
      { label: 'p', code: 'KeyP' },
      { label: 'y', code: 'KeyY' },
      { label: 'f', code: 'KeyF' },
      { label: 'g', code: 'KeyG' },
      { label: 'c', code: 'KeyC' },
      { label: 'r', code: 'KeyR' },
      { label: 'l', code: 'KeyL' },
      { label: '/', code: 'Slash' },
      { label: '=', code: 'Equal' },
    ],
  },
  {
    indent: 2,
    keys: [
      { label: 'a', code: 'KeyA' },
      { label: 'o', code: 'KeyO' },
      { label: 'e', code: 'KeyE' },
      { label: 'u', code: 'KeyU' },
      { label: 'i', code: 'KeyI' },
      { label: 'd', code: 'KeyD' },
      { label: 'h', code: 'KeyH' },
      { label: 't', code: 'KeyT' },
      { label: 'n', code: 'KeyN' },
      { label: 's', code: 'KeyS' },
      { label: '-', code: 'Minus' },
    ],
  },
  {
    indent: 3,
    keys: [
      { label: ';', code: 'Semicolon' },
      { label: 'q', code: 'KeyQ' },
      { label: 'j', code: 'KeyJ' },
      { label: 'k', code: 'KeyK' },
      { label: 'x', code: 'KeyX' },
      { label: 'b', code: 'KeyB' },
      { label: 'm', code: 'KeyM' },
      { label: 'w', code: 'KeyW' },
      { label: 'v', code: 'KeyV' },
      { label: 'z', code: 'KeyZ' },
    ],
  },
  {
    keys: [{ label: 'Space', code: 'Space', width: 6 }],
  },
];

export const HOME_ROW = 'aoeuidhtns';
export const TOP_ROW = '\',.pyfgcrl';
export const BOTTOM_ROW = ';qjkxbmwvz';

const CHAR_TO_CODE: Record<string, string> = {};

for (const row of DVORAK_ROWS) {
  for (const key of row.keys) {
    if (key.code !== 'Space') {
      CHAR_TO_CODE[key.label.toLowerCase()] = key.code;
      CHAR_TO_CODE[key.label] = key.code;
    }
  }
}

CHAR_TO_CODE[' '] = 'Space';
CHAR_TO_CODE['\n'] = 'Enter';

/** Maps a typed character to its physical key code on a Dvorak keyboard. */
export function charToKeyCode(char: string): string | undefined {
  return CHAR_TO_CODE[char] ?? CHAR_TO_CODE[char.toLowerCase()];
}
