import type { HardwareLayout } from '@/utils/keyboard/keyboardLayouts';
import { getLayoutRows } from '@/utils/keyboard/keyboardLayouts';

export type GridKeyVariant = 'typing' | 'modifier' | 'blind' | 'iso-enter';

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
const DEFAULT_SPAN = 4;

const TOKEN_COL_SPAN: Record<string, number> = {
  '[backspace]': 6,
  '[tab]': 6,
  '[caps]': 7,
  '[lshift]': 9,
  '[lshift-iso]': 5,
  '[rshift]': 10,
  '[enter]': 9,
  '[enter-iso]': 5,
  '[space]': 24,
  '[fn]': 4,
  '[ctrl]': 4,
  '[opt]': 4,
  '[cmd]': 5,
  '[arrows]': 11,
};

const BLIND_TOKENS = new Set([
  '[fn]',
  '[ctrl]',
  '[opt]',
  '[cmd]',
  '[arrows]',
  '[tab]',
  '[caps]',
  '[backspace]',
]);

const MODIFIER_LABELS: Record<string, string> = {
  '[tab]': 'Tab',
  '[caps]': 'Caps',
  '[backspace]': '⌫',
  '[lshift]': '⇧',
  '[lshift-iso]': '⇧',
  '[rshift]': '⇧',
  '[enter]': '↵',
  '[enter-iso]': '↵',
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

function colSpanForToken(token: string): number {
  return TOKEN_COL_SPAN[token] ?? DEFAULT_SPAN;
}

function resolveTokenMeta(token: string): Pick<GridKeyDef, 'label' | 'code' | 'variant'> {
  if (token === '[enter-iso]') {
    return { label: MODIFIER_LABELS[token], code: 'Enter', variant: 'iso-enter' };
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

function buildRow(
  rowIndex: number,
  tokens: readonly string[],
  layout: HardwareLayout,
  reservedTail = 0,
): GridKeyDef[] {
  const row = rowIndex + 1;
  const keys: GridKeyDef[] = [];
  let col = 1;
  const maxCol = GRID_COLUMNS - reservedTail + 1;

  for (const token of tokens) {
    if (token === '[enter-iso]') continue;

    const colSpan = colSpanForToken(token);
    if (col + colSpan > maxCol) break;

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

  return keys;
}

function appendIsoEnter(keys: GridKeyDef[], layout: HardwareLayout): void {
  const colStart = GRID_COLUMNS - TOKEN_COL_SPAN['[enter-iso]'] + 1;
  keys.push({
    id: `${layout}-enter-iso`,
    token: '[enter-iso]',
    label: MODIFIER_LABELS['[enter-iso]'],
    code: 'Enter',
    row: 2,
    colStart,
    colSpan: TOKEN_COL_SPAN['[enter-iso]'],
    rowSpan: 2,
    variant: 'iso-enter',
  });
}

/** Builds a 60-column CSS grid key map for the requested hardware layout. */
export function buildHardwareGrid(layout: HardwareLayout): GridKeyDef[] {
  const rows = getLayoutRows(layout);
  const keys: GridKeyDef[] = [];

  rows.forEach((tokens, rowIndex) => {
    if (layout === 'MAC_ISO' && rowIndex === 1) {
      keys.push(...buildRow(rowIndex, tokens, layout, TOKEN_COL_SPAN['[enter-iso]']));
      return;
    }

    if (layout === 'MAC_ISO' && rowIndex === 2) {
      const rowKeys = buildRow(rowIndex, tokens, layout, TOKEN_COL_SPAN['[enter-iso]']);
      keys.push(...rowKeys);
      appendIsoEnter(keys, layout);
      return;
    }

    keys.push(...buildRow(rowIndex, tokens, layout));
  });

  return keys;
}
