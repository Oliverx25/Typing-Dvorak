export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  elapsedSeconds: number;
}

export const TEST_DURATION_SECONDS = 60;
export const ERROR_PENALTY_CHARS = 2;

/** Standard WPM: (correct characters / 5) / minutes elapsed. */
export function calculateWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60_000;
  return Math.round((correctChars / 5) / minutes);
}

/** Test mode WPM with error penalty on effective character count. */
export function calculateTestWpm(
  correctChars: number,
  incorrectChars: number,
  elapsedMs: number,
): number {
  const effective = Math.max(0, correctChars - incorrectChars * ERROR_PENALTY_CHARS);
  return calculateWpm(effective, elapsedMs);
}

export function calculateAccuracy(correct: number, incorrect: number): number {
  const total = correct + incorrect;
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

export function buildStats(
  correctChars: number,
  incorrectChars: number,
  elapsedMs: number,
  testMode = false,
): TypingStats {
  return {
    wpm: testMode
      ? calculateTestWpm(correctChars, incorrectChars, elapsedMs)
      : calculateWpm(correctChars, elapsedMs),
    accuracy: calculateAccuracy(correctChars, incorrectChars),
    correctChars,
    incorrectChars,
    elapsedSeconds: Math.round(elapsedMs / 1000),
  };
}

export function pickRandomText(texts: string[]): string {
  return texts[Math.floor(Math.random() * texts.length)];
}
