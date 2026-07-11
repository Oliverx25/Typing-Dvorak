import { describe, expect, it } from 'vitest';
import { DVORAK_ANSI, DVORAK_MAC_ISO } from '@/utils/keyboard/keyboardLayouts';
import { buildHardwareGrid, GRID_COLUMNS, rowSpanTotal } from '@/utils/keyboard/hardwareGrid';

describe('buildHardwareGrid', () => {
  it('sums every ANSI row to exactly 60 columns', () => {
    for (const row of DVORAK_ANSI) {
      expect(rowSpanTotal(row, 'ANSI')).toBe(GRID_COLUMNS);
    }

    const keys = buildHardwareGrid('ANSI');
    expect(keys.some((key) => key.token === '[enter]')).toBe(true);
    expect(keys.find((key) => key.token === '[backspace]')?.colSpan).toBe(8);
    expect(keys.find((key) => key.token === '[rshift]')?.colSpan).toBe(11);
  });

  it('sums every Mac ISO row to exactly 60 columns', () => {
    for (const row of DVORAK_MAC_ISO) {
      expect(rowSpanTotal(row, 'MAC_ISO')).toBe(GRID_COLUMNS);
    }

    const keys = buildHardwareGrid('MAC_ISO');
    const isoEnter = keys.find((key) => key.token === '[enter-iso-top]');
    expect(isoEnter?.colSpan).toBe(6);
    expect(isoEnter?.variant).toBe('modifier');
    expect(keys.some((key) => key.token === '[enter-iso-bottom]')).toBe(true);
    expect(keys.some((key) => key.label === '§')).toBe(true);
  });
});
