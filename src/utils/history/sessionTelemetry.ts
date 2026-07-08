import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';

export interface SessionTelemetryPayload {
  keystrokeLog: KeystrokeLogEntry[];
  consistency: number;
  troubleKeys: string[];
  correctChars: number;
  incorrectChars: number;
  elapsedMs: number;
  stopOnError?: boolean;
}

export interface CloudKeystrokeLogEntry {
  index: number;
  expectedChar: string;
  typedChar: string;
  isCorrect: boolean;
  timeSinceLastKey: number;
}

export function serializeKeystrokeLogForCloud(log: KeystrokeLogEntry[]): CloudKeystrokeLogEntry[] {
  return log.map((entry) => ({
    index: entry.index,
    expectedChar: entry.expectedChar,
    typedChar: entry.typedChar,
    isCorrect: entry.isCorrect,
    timeSinceLastKey: entry.timeSinceLastKey,
  }));
}

export function parseCloudKeystrokeLog(value: unknown): KeystrokeLogEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry, fallbackIndex) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Partial<CloudKeystrokeLogEntry>;
      if (
        typeof row.expectedChar !== 'string' ||
        typeof row.typedChar !== 'string' ||
        typeof row.isCorrect !== 'boolean'
      ) {
        return null;
      }

      return {
        index: typeof row.index === 'number' ? row.index : fallbackIndex,
        expectedChar: row.expectedChar,
        typedChar: row.typedChar,
        isCorrect: row.isCorrect,
        timestamp: 0,
        timeSinceLastKey: typeof row.timeSinceLastKey === 'number' ? row.timeSinceLastKey : 0,
      } satisfies KeystrokeLogEntry;
    })
    .filter((entry): entry is KeystrokeLogEntry => entry != null);
}

export function parseCloudTroubleKeys(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((key): key is string => typeof key === 'string' && key.length > 0);
}

export function isCloudSessionId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}
