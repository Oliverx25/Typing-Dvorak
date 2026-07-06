import { DVORAK_ROWS, type KeyboardRow, type KeyDef } from '@/utils/keyboard/dvorak';

export type LayoutId = 'qwerty' | 'dvorak';

export const LAYOUT_IDS: LayoutId[] = ['qwerty', 'dvorak'];

/** Row index of the home row — matches `DVORAK_ROWS` / lesson keyboard. */
export const HOME_ROW_INDEX = 2;

/** Dvorak home-row vowels — all under the left hand. */
export const DVORAK_HOME_VOWELS = new Set(['a', 'o', 'e', 'u', 'i']);

function stripHomeMarks(keys: KeyDef[]): KeyDef[] {
  return keys.map((key) => ({ ...key, homeRowMark: undefined }));
}

/**
 * QWERTY (US) labels in the same row geometry as `DVORAK_ROWS` / lesson keyboard.
 * Each slot reuses the Dvorak row's `code` and `width` so stagger and key sizes match.
 */
export const QWERTY_ROWS: KeyboardRow[] = [
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
      { label: '-', code: 'BracketLeft' },
      { label: '=', code: 'BracketRight' },
    ],
  },
  {
    indent: 1,
    keys: [
      { label: 'q', code: 'Quote' },
      { label: 'w', code: 'Comma' },
      { label: 'e', code: 'Period' },
      { label: 'r', code: 'KeyP' },
      { label: 't', code: 'KeyY' },
      { label: 'y', code: 'KeyF' },
      { label: 'u', code: 'KeyG' },
      { label: 'i', code: 'KeyC' },
      { label: 'o', code: 'KeyR' },
      { label: 'p', code: 'KeyL' },
      { label: '[', code: 'Slash' },
      { label: ']', code: 'Equal' },
    ],
  },
  {
    indent: 2,
    keys: [
      { label: 'a', code: 'KeyA' },
      { label: 's', code: 'KeyO' },
      { label: 'd', code: 'KeyE' },
      { label: 'f', code: 'KeyU' },
      { label: 'g', code: 'KeyI' },
      { label: 'h', code: 'KeyD' },
      { label: 'j', code: 'KeyH' },
      { label: 'k', code: 'KeyT' },
      { label: 'l', code: 'KeyN' },
      { label: ';', code: 'KeyS' },
      { label: "'", code: 'Minus' },
    ],
  },
  {
    indent: 3,
    keys: [
      { label: 'z', code: 'Semicolon' },
      { label: 'x', code: 'KeyQ' },
      { label: 'c', code: 'KeyJ' },
      { label: 'v', code: 'KeyK' },
      { label: 'b', code: 'KeyX' },
      { label: 'n', code: 'KeyB' },
      { label: 'm', code: 'KeyM' },
      { label: ',', code: 'KeyW' },
      { label: '.', code: 'KeyV' },
      { label: '/', code: 'KeyZ' },
    ],
  },
  {
    indent: 3.5,
    keys: [{ label: 'Space', code: 'Space', width: 5.5 }],
  },
];

/** Full keyboard layouts — same geometry as lesson `Keyboard`, labels per layout. */
export const COMPARATOR_LAYOUTS: Record<LayoutId, KeyboardRow[]> = {
  qwerty: QWERTY_ROWS.map((row) => ({ indent: row.indent, keys: stripHomeMarks(row.keys) })),
  dvorak: DVORAK_ROWS.map((row) => ({ indent: row.indent, keys: stripHomeMarks(row.keys) })),
};
