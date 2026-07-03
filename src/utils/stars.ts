/** Star rating 1–3 based on session performance. */
export function calculateStars(accuracy: number, _wpm?: number): 1 | 2 | 3 {
  if (accuracy >= 98) return 3;
  if (accuracy >= 90) return 2;
  return 1;
}

export function starsLabel(stars: 1 | 2 | 3): string {
  return `${stars}/3`;
}
