export type LayoutId = 'qwerty' | 'dvorak';

export interface LayoutRow {
  keys: string[];
  homeRow?: boolean;
}

export interface KeyboardLayout {
  id: LayoutId;
  rows: LayoutRow[];
}

/** Minimal 3-row letter layouts for the QWERTY vs Dvorak visualizer. */
export const KEYBOARD_LAYOUTS: Record<LayoutId, KeyboardLayout> = {
  qwerty: {
    id: 'qwerty',
    rows: [
      { keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'] },
      { keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], homeRow: true },
      { keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm'] },
    ],
  },
  dvorak: {
    id: 'dvorak',
    rows: [
      { keys: ["'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l'] },
      { keys: ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's'], homeRow: true },
      { keys: [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z'] },
    ],
  },
};

export const LAYOUT_IDS: LayoutId[] = ['qwerty', 'dvorak'];

/** Dvorak home-row vowels — all under the left hand. */
export const DVORAK_HOME_VOWELS = new Set(['a', 'o', 'e', 'u', 'i']);
