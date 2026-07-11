import type { HardwareLayout } from '@/utils/keyboard/keyboardLayouts';
import { getLayoutRows } from '@/utils/keyboard/keyboardLayouts';

export type GridKeyVariant = 'typing' | 'modifier' | 'blind' | 'gap';

export interface GridKeyDef {
  id: string;
  token: string;
  label: string;
  code: string | null;
  row: number;
  colStart: number;
  colSpan: number;
  rowSpan: number;
  variant: GridKeyVariant;
  homeRowMark?: boolean;
}

export const GRID_COLUMNS = 60;
const NORMAL_SPAN = 4;

/** Every row must sum to exactly 60 column units. */
export const TOKEN_COL_SPAN: Record<string, number> = {
  '[backspace]': 8,
  '[tab]': 6,
  '[caps]': 7,
  '[lshift]': 9,
  '[lshift-iso]': 5,
  '[rshift]': 11,
  '[enter]': 9,
  '[enter-iso-top]': 6,
  '[enter-iso-bottom]': 5,
  '\\': 6,
  '[iso-backslash]': 4,
  '[space]': 24,
  '[fn]': 4,
  '[ctrl]': 4,
  '[opt]': 4,
  '[cmd]': 4,
  '[arrows]': 12,
};

const BLIND_TOKENS = new Set([
  '[fn]',
  '[ctrl]',
  '[opt]',
  '[cmd]',
  '[tab]',
  '[caps]',
  '[backspace]',
  '[enter-iso-bottom]',
]);

const MODIFIER_LABELS: Record<string, string> = {
  '[tab]': 'Tab',
  '[caps]': 'Caps',
  '[backspace]': '⌫',
  '[lshift]': '⇧',
  '[lshift-iso]': '⇧',
  '[rshift]': '⇧',
  '[enter]': '↵',
  '[enter-iso-top]': '↵',
  '[fn]': 'fn',
  '[ctrl]': 'Ctrl',
  '[opt]': '⌥',
  '[cmd]': '⌘',
  '[arrows]': '◀▶',
  '[space]': 'Space',
};

const LABEL_TO_CODE: Record<string, string> = {
  '`': 'Backquote',
  '§': 'IntlBackslash',
  '1': 'Digit1',
  '2': 'Digit2',
  '3': 'Digit3',
  '4': 'Digit4',
  '5': 'Digit5',
  '6': 'Digit6',
  '7': 'Digit7',
  '8': 'Digit8',
  '9': 'Digit9',
  '0': 'Digit0',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  "'": 'Quote',
  ',': 'Comma',
  '.': 'Period',
  p: 'KeyP',
  y: 'KeyY',
  f: 'KeyF',
  g: 'KeyG',
  c: 'KeyC',
  r: 'KeyR',
  l: 'KeyL',
  '/': 'Slash',
  '=': 'Equal',
  '\\': 'Backslash',
  a: 'KeyA',
  o: 'KeyO',
  e: 'KeyE',
  u: 'KeyU',
  i: 'KeyI',
  d: 'KeyD',
  h: 'KeyH',
  t: 'KeyT',
  n: 'KeyN',
  s: 'KeyS',
  '-': 'Minus',
  ';': 'Semicolon',
  q: 'KeyQ',
  j: 'KeyJ',
  k: 'KeyK',
  x: 'KeyX',
  b: 'KeyB',
  m: 'KeyM',
  w: 'KeyW',
  v: 'KeyV',
  z: 'KeyZ',
};

const HOME_ROW_CODES = new Set(['KeyU', 'KeyH']);

function colSpanForToken(token: string, layout: HardwareLayout): number {
  if (token === '\\' && layout === 'MAC_ISO') {
    return TOKEN_COL_SPAN['[iso-backslash]'];
  }
  return TOKEN_COL_SPAN[token] ?? NORMAL_SPAN;
}

function resolveTokenMeta(token: string): Pick<GridKeyDef, 'label' | 'code' | 'variant'> {
  if (token === '[enter-iso-top]') {
    return {
      label: MODIFIER_LABELS[token],
      code: 'Enter',
      variant: 'modifier',
    };
  }

  if (token === '[arrows]') {
    return { label: '', code: null, variant: 'gap' };
  }

  if (token === '[space]') {
    return { label: 'Space', code: 'Space', variant: 'modifier' };
  }

  if (token === '[enter]') {
    return { label: MODIFIER_LABELS[token], code: 'Enter', variant: 'modifier' };
  }

  if (BLIND_TOKENS.has(token)) {
    const code =
      token === '[tab]'
        ? 'Tab'
        : token === '[caps]'
          ? 'CapsLock'
          : token === '[backspace]'
            ? 'Backspace'
            : null;
    return { label: MODIFIER_LABELS[token] ?? token, code, variant: 'blind' };
  }

  if (token === '[lshift]' || token === '[lshift-iso]' || token === '[rshift]') {
    const code = token === '[rshift]' ? 'ShiftRight' : 'ShiftLeft';
    return { label: MODIFIER_LABELS[token], code, variant: 'blind' };
  }

  const code = LABEL_TO_CODE[token] ?? null;
  return { label: token, code, variant: 'typing' };
}

function buildRow(rowIndex: number, tokens: readonly string[], layout: HardwareLayout): GridKeyDef[] {
  const row = rowIndex + 1;
  const keys: GridKeyDef[] = [];
  let col = 1;

  for (const token of tokens) {
    const colSpan = colSpanForToken(token, layout);
    const meta = resolveTokenMeta(token);
    const code = meta.code ?? undefined;

    keys.push({
      id: `${layout}-r${row}-${token}-${col}`,
      token,
      label: meta.label,
      code: meta.code,
      row,
      colStart: col,
      colSpan,
      rowSpan: 1,
      variant: meta.variant,
      homeRowMark: code ? HOME_ROW_CODES.has(code) : false,
    });

    col += colSpan;
  }

  if (col !== GRID_COLUMNS + 1) {
    throw new Error(
      `${layout} row ${row} spans ${col - 1} columns (expected ${GRID_COLUMNS}): ${tokens.join(', ')}`,
    );
  }

  return keys;
}

/** Builds a 60-column CSS grid key map for the requested hardware layout. */
export function buildHardwareGrid(layout: HardwareLayout): GridKeyDef[] {
  const rows = getLayoutRows(layout);
  return rows.flatMap((tokens, rowIndex) => buildRow(rowIndex, tokens, layout));
}

/** Row span totals — exported for tests. */
export function rowSpanTotal(tokens: readonly string[], layout: HardwareLayout): number {
  return tokens.reduce((sum, token) => sum + colSpanForToken(token, layout), 0);
}
