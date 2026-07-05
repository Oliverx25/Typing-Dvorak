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

export interface TimelinePoint {
  timeMs: number;
  charIndex: number;
}

/**
 * Char index for a musical pacer synced to LRC word timestamps.
 * The hare holds position during instrumental gaps and jumps word-by-word during vocals.
 */
export function timelineCursorIndex(
  elapsedMs: number,
  timeline: TimelinePoint[],
  totalChars: number,
): number {
  if (totalChars <= 0 || timeline.length === 0) return 0;

  if (elapsedMs < timeline[0]!.timeMs) return 0;

  let lo = 0;
  let hi = timeline.length - 1;
  let result = timeline[0]!.charIndex;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const point = timeline[mid]!;
    if (point.timeMs <= elapsedMs) {
      result = point.charIndex;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return Math.min(totalChars, result);
}
