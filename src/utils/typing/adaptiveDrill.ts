import { getWeakestKeys } from '@/utils/stats/keyStats';
import { generateDrillText } from '@/utils/typing/textGenerator';

/** Builds practice text focused on the user's weakest keys. */
export function generateAdaptiveDrillText(length = 48): string | null {
  const weak = getWeakestKeys(5);
  if (weak.length === 0) return null;

  const chars = weak.map((w) => w.label).join('');
  return generateDrillText(chars, length);
}

export function getAdaptiveDrillKeys(): string[] {
  return getWeakestKeys(5).map((w) => w.label);
}
