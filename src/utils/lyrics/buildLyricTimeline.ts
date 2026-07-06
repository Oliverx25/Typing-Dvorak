import { countLyricWords } from '@/utils/lyrics/typingDifficulty';
import { isNonVocalLrcLine, type LrcLine } from '@/utils/lyrics/parseLrc';
import type { LyricWordTiming, WpmProfile } from '@/utils/lyrics/types';

const MAX_SILENCE_DURATION_SEC = 12;
const MIN_ACTIVE_LINE_WPM = 8;
const MIN_SILENCE_DURATION_SEC = 5;
/** Max seconds to spread words within one LRC line; longer gaps are instrumental holds. */
const MAX_VOCAL_SPREAD_SEC = 8;

function cleanLrcLineText(text: string): string {
  return text.replace(/\[[^\]]*]/g, '').replace(/\([^)]*\)/g, '').trim();
}

/** Character indices where each whitespace-delimited word begins. */
export function wordStartIndices(text: string): number[] {
  const indices: number[] = [];
  let i = 0;

  while (i < text.length) {
    if (/\s/.test(text[i]!)) {
      i += 1;
      continue;
    }
    indices.push(i);
    while (i < text.length && !/\s/.test(text[i]!)) i += 1;
  }

  return indices;
}

interface AlignedLine {
  timeSeconds: number;
  wordCount: number;
}

function distributePlainWords(vocalLines: LrcLine[], plainWordCount: number): AlignedLine[] | null {
  const lineWordCounts = vocalLines.map((line) => countLyricWords(cleanLrcLineText(line.text)));
  const lrcWordTotal = lineWordCounts.reduce((sum, count) => sum + count, 0);
  if (lrcWordTotal === 0) return null;

  const aligned: AlignedLine[] = [];
  let assigned = 0;

  for (let i = 0; i < vocalLines.length; i += 1) {
    const line = vocalLines[i]!;
    const remainingLines = vocalLines.length - i;
    const remainingWords = plainWordCount - assigned;
    if (remainingWords <= 0) break;

    let share: number;
    if (lrcWordTotal === plainWordCount) {
      share = lineWordCounts[i]!;
    } else if (i === vocalLines.length - 1) {
      share = remainingWords;
    } else {
      const weight = lineWordCounts[i]! / lrcWordTotal;
      share = Math.max(1, Math.round(weight * plainWordCount));
      share = Math.min(share, remainingWords - (remainingLines - 1));
    }

    if (share <= 0) continue;
    aligned.push({ timeSeconds: line.timeSeconds, wordCount: share });
    assigned += share;
  }

  return assigned === plainWordCount ? aligned : null;
}

function lineGapSec(
  aligned: AlignedLine[],
  index: number,
  durationMs: number | null,
): number {
  const current = aligned[index]!;
  const next = aligned[index + 1];
  const endSeconds =
    next?.timeSeconds ??
    (durationMs && durationMs > 0 ? durationMs / 1000 : current.timeSeconds + 4);
  return Math.max(0.05, endSeconds - current.timeSeconds);
}

/** Vocal spread caps long gaps so the hare stops during instrumentals. */
function vocalSpreadSec(gapSec: number): number {
  return Math.min(gapSec, MAX_VOCAL_SPREAD_SEC);
}

function isActiveVocalLine(gapSec: number, wordCount: number, lineWpm: number): boolean {
  if (wordCount === 0) return false;
  if (gapSec > MAX_SILENCE_DURATION_SEC && wordCount <= 1) return false;
  if (gapSec > MIN_SILENCE_DURATION_SEC && lineWpm < MIN_ACTIVE_LINE_WPM) return false;
  return true;
}

export interface BuiltLyricTimeline {
  timeline: LyricWordTiming[];
  wpmProfile: WpmProfile;
}

/**
 * Builds a word-level char timeline from LRC timestamps and sanitized plain lyrics.
 * Returns null when alignment fails (caller should fall back to linear WPM pacing).
 */
export function buildLyricTimelineFromLrc(
  lrcLines: LrcLine[],
  plainLyrics: string,
  durationMs: number | null,
): BuiltLyricTimeline | null {
  const vocalLines = lrcLines.filter((line) => !isNonVocalLrcLine(line.text));
  const plainWordCount = countLyricWords(plainLyrics);
  if (vocalLines.length === 0 || plainWordCount === 0) return null;

  const aligned = distributePlainWords(vocalLines, plainWordCount);
  if (!aligned || aligned.length === 0) return null;

  const charIndices = wordStartIndices(plainLyrics);
  const timeline: LyricWordTiming[] = [];
  const activeLineWpms: number[] = [];
  let wordPointer = 0;

  for (let i = 0; i < aligned.length; i += 1) {
    const { timeSeconds, wordCount } = aligned[i]!;
    const gapSec = lineGapSec(aligned, i, durationMs);
    const spreadSec = vocalSpreadSec(gapSec);
    const lineWpm = (wordCount / spreadSec) * 60;

    if (isActiveVocalLine(gapSec, wordCount, lineWpm)) {
      activeLineWpms.push(lineWpm);
    }

    for (let w = 0; w < wordCount; w += 1) {
      const charIndex = charIndices[wordPointer];
      if (charIndex === undefined) return null;

      const wordTimeSec = timeSeconds + (spreadSec * w) / wordCount;
      timeline.push({
        timeMs: Math.round(wordTimeSec * 1000),
        charIndex,
      });
      wordPointer += 1;
    }
  }

  if (wordPointer !== charIndices.length || timeline.length === 0) return null;

  const activeWpm =
    activeLineWpms.length > 0
      ? Math.round(activeLineWpms.reduce((sum, wpm) => sum + wpm, 0) / activeLineWpms.length)
      : null;
  const peakWpm =
    activeLineWpms.length > 0 ? Math.round(Math.max(...activeLineWpms)) : null;

  return {
    timeline,
    wpmProfile: { activeWpm, peakWpm },
  };
}
