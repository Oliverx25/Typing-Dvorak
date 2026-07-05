import {
  TELEPROMPTER_ACTIVE_LINE_ROW,
  TELEPROMPTER_VISIBLE_LINES,
} from './teleprompterConfig';

export interface TextLine {
  lineIndex: number;
  startIndex: number;
  endIndex: number;
}

export type OffScreenDirection = 'above' | 'below';

/** Splits target text into logical lines, preserving original char indices. */
export function splitTargetTextIntoLines(text: string): TextLine[] {
  if (!text) return [{ lineIndex: 0, startIndex: 0, endIndex: 0 }];

  const lines: TextLine[] = [];
  let lineStart = 0;
  let lineIndex = 0;

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== '\n') continue;
    lines.push({ lineIndex, startIndex: lineStart, endIndex: i + 1 });
    lineStart = i + 1;
    lineIndex += 1;
  }

  lines.push({ lineIndex, startIndex: lineStart, endIndex: text.length });
  return lines;
}

/** Maps a character index to its line index. */
export function charIndexToLineIndex(lines: TextLine[], charIndex: number): number {
  if (lines.length === 0) return 0;

  const clamped = Math.max(0, Math.min(charIndex, lines[lines.length - 1]!.endIndex));
  for (const line of lines) {
    if (clamped >= line.startIndex && clamped < line.endIndex) return line.lineIndex;
  }

  return lines[lines.length - 1]!.lineIndex;
}

/** Visible line window pinned around the player row. */
export function getVisibleLineRange(
  playerLineIndex: number,
  totalLines: number,
  visibleLines = TELEPROMPTER_VISIBLE_LINES,
  activeRow = TELEPROMPTER_ACTIVE_LINE_ROW,
): { startLine: number; endLine: number } {
  if (totalLines <= 0) return { startLine: 0, endLine: 0 };

  const maxStart = Math.max(0, totalLines - visibleLines);
  const startLine = Math.min(Math.max(0, playerLineIndex - (activeRow - 1)), maxStart);
  const endLine = Math.min(totalLines - 1, startLine + visibleLines - 1);

  return { startLine, endLine };
}

export function getVisibleCharBounds(
  lines: TextLine[],
  startLine: number,
  endLine: number,
): { from: number; to: number } {
  const start = lines[startLine]?.startIndex ?? 0;
  const end = lines[endLine]?.endIndex ?? start;
  return { from: start, to: end };
}

export function getOffScreenDirection(
  cursorLineIndex: number | null,
  startLine: number,
  endLine: number,
): OffScreenDirection | null {
  if (cursorLineIndex === null) return null;
  if (cursorLineIndex < startLine) return 'above';
  if (cursorLineIndex > endLine) return 'below';
  return null;
}

/** True when a pacing cursor should render inline (inside the virtualized window). */
export function isCursorVisibleInLineWindow(
  cursorIndex: number | null,
  playerIndex: number,
  lines: TextLine[],
  startLine: number,
  endLine: number,
): boolean {
  if (cursorIndex === null || cursorIndex === playerIndex) return false;
  const lineIndex = charIndexToLineIndex(lines, cursorIndex);
  return lineIndex >= startLine && lineIndex <= endLine;
}
