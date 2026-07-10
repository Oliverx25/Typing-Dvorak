/** Words still available ahead of the current cursor position. */
export function countRemainingWords(text: string, typedLength: number): number {
  const remaining = text.slice(typedLength).trim();
  if (!remaining) return 0;
  return remaining.split(/\s+/).filter(Boolean).length;
}
