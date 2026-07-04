import { DVORAK_ROWS, type KeyboardRow, type KeyDef } from './dvorak';

export type LayoutId = 'qwerty' | 'dvorak';

export const LAYOUT_IDS: LayoutId[] = ['qwerty', 'dvorak'];

/** Row index of the home row — matches `DVORAK_ROWS` / lesson keyboard. */
export const HOME_ROW_INDEX = 2;

/** Dvorak home-row vowels — all under the left hand. */
export const DVORAK_HOME_VOWELS = new Set(['a', 'o', 'e', 'u', 'i']);

const SPECIAL_QWERTY_LABELS: Record<string, string> = {
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  Space: 'Space',
};

/** QWERTY legend for a physical key code (US ANSI). */
export function qwertyLabelForCode(code: string): string {
  if (code === 'Space') return 'Space';
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Key')) return code.slice(3).toLowerCase();
  return SPECIAL_QWERTY_LABELS[code] ?? code;
}

function stripHomeMarks(keys: KeyDef[]): KeyDef[] {
  return keys.map((key) => ({ ...key, homeRowMark: undefined }));
}

function toQwertyRow(row: KeyboardRow): KeyboardRow {
  return {
    indent: row.indent,
    keys: stripHomeMarks(
      row.keys.map((key) => ({
        ...key,
        label: qwertyLabelForCode(key.code),
      })),
    ),
  };
}

/** Full keyboard layouts — same geometry as lesson `Keyboard`, labels per layout. */
export const COMPARATOR_LAYOUTS: Record<LayoutId, KeyboardRow[]> = {
  qwerty: DVORAK_ROWS.map(toQwertyRow),
  dvorak: DVORAK_ROWS.map((row) => ({ indent: row.indent, keys: stripHomeMarks(row.keys) })),
};
