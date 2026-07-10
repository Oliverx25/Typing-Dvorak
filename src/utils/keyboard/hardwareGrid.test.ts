import { describe, expect, it } from 'vitest';
import { buildHardwareGrid, GRID_COLUMNS } from '@/utils/keyboard/hardwareGrid';

function maxColumnEnd(keys: ReturnType<typeof buildHardwareGrid>): number {
  return keys.reduce((max, key) => Math.max(max, key.colStart + key.colSpan - 1), 0);
}

describe('buildHardwareGrid', () => {
  it('fits ANSI rows within the 60-column grid', () => {
    const keys = buildHardwareGrid('ANSI');
    expect(maxColumnEnd(keys)).toBeLessThanOrEqual(GRID_COLUMNS);
    expect(keys.some((key) => key.token === '[enter]')).toBe(true);
    expect(keys.some((key) => key.token === '\\')).toBe(true);
  });

  it('fits Mac ISO rows and renders the tall Enter key', () => {
    const keys = buildHardwareGrid('MAC_ISO');
    expect(maxColumnEnd(keys)).toBeLessThanOrEqual(GRID_COLUMNS);
    const isoEnter = keys.find((key) => key.token === '[enter-iso]');
    expect(isoEnter?.rowSpan).toBe(2);
    expect(keys.some((key) => key.label === '§')).toBe(true);
    expect(keys.some((key) => key.token === '[lshift-iso]')).toBe(true);
    expect(keys.filter((key) => key.token === '\\' || key.label === '\\')).toHaveLength(1);
  });
});
