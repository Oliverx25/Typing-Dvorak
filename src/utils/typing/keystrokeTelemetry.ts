export interface KeystrokeLogEntry {
  index: number;
  expectedChar: string;
  typedChar: string;
  isCorrect: boolean;
  timestamp: number;
  timeSinceLastKey: number;
}

export function createKeystrokeEntry(
  index: number,
  expectedChar: string,
  typedChar: string,
  isCorrect: boolean,
  previousTimestamp: number | null,
): KeystrokeLogEntry {
  const timestamp = performance.now();
  return {
    index,
    expectedChar,
    typedChar,
    isCorrect,
    timestamp,
    timeSinceLastKey: previousTimestamp != null ? Math.round(timestamp - previousTimestamp) : 0,
  };
}

/** Standard typing WPM: (characters / 5) / minutes. */
export function zenWpmFromChars(charCount: number, elapsedMs: number): number {
  if (charCount <= 0 || elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60_000;
  return Math.round(charCount / 5 / minutes);
}
