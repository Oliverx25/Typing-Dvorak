export interface SpanishChar {
  char: string;
  /** Dvorak keys to type (with Shift where needed) */
  keys: string;
  descriptionKey: string;
}

export interface SpanishPangram {
  id: string;
  text: string;
}

/** Spanish-specific characters on Dvorak (US layout + Alt/Shift combos). */
export const SPANISH_CHARS: SpanishChar[] = [
  { char: 'á', keys: "Option+e, a", descriptionKey: 'accentA' },
  { char: 'é', keys: "Option+e, e", descriptionKey: 'accentE' },
  { char: 'í', keys: "Option+e, i", descriptionKey: 'accentI' },
  { char: 'ó', keys: "Option+e, o", descriptionKey: 'accentO' },
  { char: 'ú', keys: "Option+e, u", descriptionKey: 'accentU' },
  { char: 'ñ', keys: "Option+n, n", descriptionKey: 'enye' },
  { char: 'Ñ', keys: "Shift + Option+n, n", descriptionKey: 'enyeUpper' },
  { char: '¿', keys: "Shift + /", descriptionKey: 'questionOpen' },
  { char: '¡', keys: "Option+1", descriptionKey: 'exclaimOpen' },
];

/** Practice pangrams optimized for Spanish Dvorak. */
export const SPANISH_PANGRAMS: SpanishPangram[] = [
  {
    id: 'pangram-1',
    text: 'El veloz murciélago hindú comía feliz cardillo y kiwi.',
  },
  {
    id: 'pangram-2',
    text: 'La cigüeña tocaba el saxofón detrás del palenque de paja.',
  },
  {
    id: 'pangram-3',
    text: 'José compró una lámpara de cristal en el mercado de Quito.',
  },
  {
    id: 'pangram-4',
    text: 'Practica Dvorak cada día: áéíóú, ñ y puntuación incluidos.',
  },
];

/** Drill text combining all Spanish special chars. */
export const SPANISH_DRILL_TEXT =
  'áéíóú ñÑ ¿¡ el murciélago hindú comía kiwi feliz';
