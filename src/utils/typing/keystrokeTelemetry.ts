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

/**
 * Data decimation (bucketing) for scatter plots.
 *
 * Long sessions (songs with >1000 keystrokes) render thousands of SVG nodes in
 * Recharts, which bloats the DOM and lags the UI. This collapses the log into at
 * most `maxPoints` visual points while preserving the statistical trend:
 * - Each bucket's `timeSinceLastKey` becomes the average delta of the bucket.
 * - A bucket is flagged incorrect if it contains ANY error/correction, so those
 *   points stay visible (painted red) instead of being averaged away.
 */
export function downsampleKeystrokes(
  logs: KeystrokeLogEntry[],
  maxPoints = 150,
): KeystrokeLogEntry[] {
  if (maxPoints <= 0 || logs.length <= maxPoints) return logs;

  const chunkSize = Math.ceil(logs.length / maxPoints);
  const sampled: KeystrokeLogEntry[] = [];

  for (let start = 0; start < logs.length; start += chunkSize) {
    const chunk = logs.slice(start, start + chunkSize);
    if (chunk.length === 0) continue;

    const positiveDeltas = chunk
      .map((entry) => entry.timeSinceLastKey)
      .filter((ms) => ms > 0);
    const averageDelta =
      positiveDeltas.length > 0
        ? Math.round(positiveDeltas.reduce((sum, ms) => sum + ms, 0) / positiveDeltas.length)
        : 0;

    const hasError = chunk.some((entry) => !entry.isCorrect);
    const representative = chunk[Math.floor(chunk.length / 2)];

    sampled.push({
      index: representative.index,
      expectedChar: representative.expectedChar,
      typedChar: representative.typedChar,
      isCorrect: !hasError,
      timestamp: representative.timestamp,
      timeSinceLastKey: averageDelta,
    });
  }

  return sampled;
}

/** Standard typing WPM: (characters / 5) / minutes. */
export function zenWpmFromChars(charCount: number, elapsedMs: number): number {
  if (charCount <= 0 || elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60_000;
  return Math.round(charCount / 5 / minutes);
}
