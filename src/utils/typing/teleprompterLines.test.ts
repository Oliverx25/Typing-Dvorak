import { describe, expect, it } from 'vitest';
import {
  charIndexToLineIndex,
  getOffScreenDirection,
  getVisibleCharBounds,
  getVisibleLineRange,
  isCursorVisibleInLineWindow,
  splitTargetTextIntoLines,
} from './teleprompterLines';

describe('splitTargetTextIntoLines', () => {
  it('preserves char indices across newlines', () => {
    const text = 'one two\nthree four\nfive';
    const lines = splitTargetTextIntoLines(text);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toEqual({ lineIndex: 0, startIndex: 0, endIndex: 8 });
    expect(lines[1]).toEqual({ lineIndex: 1, startIndex: 8, endIndex: 19 });
    expect(lines[2]).toEqual({ lineIndex: 2, startIndex: 19, endIndex: 23 });
  });
});

describe('charIndexToLineIndex', () => {
  it('maps characters to their line', () => {
    const lines = splitTargetTextIntoLines('aa\nbb\ncc');
    expect(charIndexToLineIndex(lines, 0)).toBe(0);
    expect(charIndexToLineIndex(lines, 4)).toBe(1);
    expect(charIndexToLineIndex(lines, 7)).toBe(2);
  });
});

describe('getVisibleLineRange', () => {
  it('keeps three lines centered on the player', () => {
    expect(getVisibleLineRange(0, 10)).toEqual({ startLine: 0, endLine: 2 });
    expect(getVisibleLineRange(5, 10)).toEqual({ startLine: 4, endLine: 6 });
    expect(getVisibleLineRange(9, 10)).toEqual({ startLine: 7, endLine: 9 });
  });
});

describe('getOffScreenDirection', () => {
  it('detects above and below the virtualized window', () => {
    expect(getOffScreenDirection(1, 2, 4)).toBe('above');
    expect(getOffScreenDirection(5, 2, 4)).toBe('below');
    expect(getOffScreenDirection(3, 2, 4)).toBeNull();
    expect(getOffScreenDirection(null, 0, 2)).toBeNull();
  });
});

describe('isCursorVisibleInLineWindow', () => {
  it('only allows inline render inside the visible line window', () => {
    const text = 'aa\nbb\ncc\ndd\nee';
    const lines = splitTargetTextIntoLines(text);
    const playerIndex = 7;
    const { startLine, endLine } = getVisibleLineRange(
      charIndexToLineIndex(lines, playerIndex),
      lines.length,
    );

    expect(
      isCursorVisibleInLineWindow(playerIndex, playerIndex, lines, startLine, endLine),
    ).toBe(false);
    expect(
      isCursorVisibleInLineWindow(10, playerIndex, lines, startLine, endLine),
    ).toBe(true);
    expect(
      isCursorVisibleInLineWindow(13, playerIndex, lines, startLine, endLine),
    ).toBe(false);
  });
});

describe('getVisibleCharBounds', () => {
  it('returns char slice bounds for visible lines', () => {
    const lines = splitTargetTextIntoLines('one\ntwo\nthree');
    expect(getVisibleCharBounds(lines, 0, 1)).toEqual({ from: 0, to: 8 });
    expect(getVisibleCharBounds(lines, 1, 2)).toEqual({ from: 4, to: 13 });
  });
});
