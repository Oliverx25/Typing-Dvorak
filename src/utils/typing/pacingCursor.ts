/** Standard WPM assumes 5 characters per word. */
export const CHARS_PER_WORD = 5;

export function charsPerMsFromWpm(wpm: number): number {
  if (!Number.isFinite(wpm) || wpm <= 0) return 0;
  return (wpm * CHARS_PER_WORD) / 60000;
}

/** Char index a pacing cursor should sit on at a given elapsed time. */
export function pacingCursorIndex(elapsedMs: number, wpm: number, totalChars: number): number {
  if (totalChars <= 0 || wpm <= 0) return 0;
  return Math.min(totalChars, Math.floor(elapsedMs * charsPerMsFromWpm(wpm)));
}
