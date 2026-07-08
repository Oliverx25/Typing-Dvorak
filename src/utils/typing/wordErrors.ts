import type { CharStatus } from '@/utils/typing/typingSessionReducer';

/**
 * Whether the current word still has errors to fix before advancing (e.g. stop-on-word).
 * Includes committed incorrect chars and stop-on-error attempts that never advanced input.
 */
export function wordHasUncorrectedErrors(
  input: string,
  statuses: CharStatus[],
  errorAttemptIndices?: ReadonlySet<number>,
): boolean {
  const wordStart = Math.max(0, input.lastIndexOf(' ') + 1);

  for (let i = wordStart; i < input.length; i += 1) {
    if (statuses[i] === 'incorrect') return true;
    if (errorAttemptIndices?.has(i) && statuses[i] !== 'correct') return true;
  }

  if (errorAttemptIndices?.has(input.length)) return true;

  return false;
}
