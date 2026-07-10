/** Physical keyboard hardware — logical Dvorak mapping stays in `dvorak.ts`. */
export type HardwareLayout = 'ANSI' | 'MAC_ISO';

export type OsPreference = 'Mac' | 'Windows';

export const HARDWARE_LAYOUTS: HardwareLayout[] = ['ANSI', 'MAC_ISO'];
export const OS_PREFERENCES: OsPreference[] = ['Mac', 'Windows'];

/** Exact Dvorak labels per physical row (ANSI US). */
export const DVORAK_ANSI = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', '[backspace]'],
  ['[tab]', "'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '=', '\\'],
  ['[caps]', 'a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-', '[enter]'],
  ['[lshift]', ';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z', '[rshift]'],
  ['[fn]', '[ctrl]', '[opt]', '[cmd]', '[space]', '[cmd]', '[opt]', '[arrows]'],
] as const;

/** Mac ISO Spanish/EU physical positions — Dvorak logical labels. */
export const DVORAK_MAC_ISO = [
  ['§', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', '[backspace]'],
  ['[tab]', "'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '=', '[enter-iso-top]'],
  ['[caps]', 'a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-', '\\', '[iso-enter-slot]'],
  ['[lshift-iso]', '`', ';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z', '[rshift]'],
  ['[fn]', '[ctrl]', '[opt]', '[cmd]', '[space]', '[cmd]', '[opt]', '[arrows]'],
] as const;

export function getLayoutRows(layout: HardwareLayout): readonly (readonly string[])[] {
  return layout === 'MAC_ISO' ? DVORAK_MAC_ISO : DVORAK_ANSI;
}
