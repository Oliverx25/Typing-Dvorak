/** Single timestamped line from an LRC synced lyrics file. */
export interface LrcLine {
  timeSeconds: number;
  text: string;
}

const LRC_TIMESTAMP =
  /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/;

const INSTRUMENTAL = /instrumental/i;

/** Parses `[mm:ss.xx] lyric` lines into ordered timeline entries. */
export function parseLrc(syncedLyrics: string): LrcLine[] {
  const lines: LrcLine[] = [];

  for (const rawLine of syncedLyrics.split('\n')) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const match = trimmed.match(LRC_TIMESTAMP);
    if (!match) continue;

    const minutes = Number.parseInt(match[1], 10);
    const seconds = Number.parseInt(match[2], 10);
    const fractionRaw = match[3] ?? '';
    const fraction =
      fractionRaw.length > 0
        ? Number.parseInt(fractionRaw.padEnd(3, '0').slice(0, 3), 10) / 1000
        : 0;

    lines.push({
      timeSeconds: minutes * 60 + seconds + fraction,
      text: match[4].trim(),
    });
  }

  return lines.sort((a, b) => a.timeSeconds - b.timeSeconds);
}

/** True when an LRC line carries no singable lyric content. */
export function isNonVocalLrcLine(text: string): boolean {
  const stripped = text
    .replace(/\[[^\]]*]/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
  if (!stripped) return true;
  return INSTRUMENTAL.test(stripped);
}
