import { describe, expect, it } from 'vitest';
import { DVORAK_ROWS } from './dvorak';
import { COMPARATOR_LAYOUTS, QWERTY_ROWS } from './layouts';

function rowLabels(rows: typeof QWERTY_ROWS, rowIndex: number): string {
  return rows[rowIndex].keys.map((key) => key.label).join('');
}

describe('COMPARATOR_LAYOUTS', () => {
  it('shares row geometry between QWERTY and Dvorak', () => {
    for (let i = 0; i < DVORAK_ROWS.length; i++) {
      expect(QWERTY_ROWS[i].keys.length).toBe(DVORAK_ROWS[i].keys.length);
      expect(QWERTY_ROWS[i].indent).toBe(DVORAK_ROWS[i].indent);
    }
  });

  it('represents US QWERTY unshifted labels including symbols', () => {
    expect(rowLabels(QWERTY_ROWS, 0)).toBe('`1234567890-=');
    expect(rowLabels(QWERTY_ROWS, 1)).toBe('qwertyuiop[]');
    expect(rowLabels(QWERTY_ROWS, 2)).toBe("asdfghjkl;'");
    expect(rowLabels(QWERTY_ROWS, 3)).toBe('zxcvbnm,./');
    expect(QWERTY_ROWS[4].keys[0].label).toBe('Space');
  });

  it('keeps Dvorak symbols on the number row', () => {
    expect(rowLabels(DVORAK_ROWS, 0)).toBe('`1234567890[]');
    expect(rowLabels(DVORAK_ROWS, 1)).toBe("',.pyfgcrl/=");
    expect(rowLabels(DVORAK_ROWS, 2)).toBe('aoeuidhtns-');
    expect(rowLabels(DVORAK_ROWS, 3)).toBe(';qjkxbmwvz');
  });

  it('exposes both layouts for the comparator', () => {
    expect(COMPARATOR_LAYOUTS.qwerty).toHaveLength(5);
    expect(COMPARATOR_LAYOUTS.dvorak).toHaveLength(5);
    expect(rowLabels(COMPARATOR_LAYOUTS.qwerty, 1)).toBe('qwertyuiop[]');
  });
});
