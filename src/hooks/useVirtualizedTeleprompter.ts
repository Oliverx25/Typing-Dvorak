import { useCallback, useMemo } from 'react';
import {
  charIndexToLineIndex,
  getOffScreenDirection,
  getVisibleCharBounds,
  getVisibleLineRange,
  isCursorVisibleInLineWindow,
  splitTargetTextIntoLines,
  type OffScreenDirection,
} from '@/utils/typing/teleprompterLines';
import { useTeleprompterScroll } from './useTeleprompterScroll';

export interface PacingCursorVisibility {
  isRenderable: boolean;
  offScreen: OffScreenDirection | null;
}

interface UseVirtualizedTeleprompterOptions {
  targetText: string;
  activeIndex: number;
}

export function useVirtualizedTeleprompter({
  targetText,
  activeIndex,
}: UseVirtualizedTeleprompterOptions) {
  const lines = useMemo(() => splitTargetTextIntoLines(targetText), [targetText]);

  const playerLineIndex = useMemo(
    () => charIndexToLineIndex(lines, activeIndex),
    [lines, activeIndex],
  );

  const { startLine, endLine } = useMemo(
    () => getVisibleLineRange(playerLineIndex, lines.length),
    [playerLineIndex, lines.length],
  );

  const visibleBounds = useMemo(
    () => getVisibleCharBounds(lines, startLine, endLine),
    [lines, startLine, endLine],
  );

  const scroll = useTeleprompterScroll({
    activeIndex,
    textLength: targetText.length,
  });

  const getCursorVisibility = useCallback(
    (cursorIndex: number | null): PacingCursorVisibility => {
      const cursorLineIndex =
        cursorIndex === null ? null : charIndexToLineIndex(lines, cursorIndex);

      return {
        isRenderable: isCursorVisibleInLineWindow(
          cursorIndex,
          activeIndex,
          lines,
          startLine,
          endLine,
        ),
        offScreen: getOffScreenDirection(cursorLineIndex, startLine, endLine),
      };
    },
    [lines, activeIndex, startLine, endLine],
  );

  return {
    lines,
    playerLineIndex,
    startLine,
    endLine,
    visibleBounds,
    hiddenLinesAbove: startLine,
    hiddenLinesBelow: Math.max(0, lines.length - 1 - endLine),
    getCursorVisibility,
    ...scroll,
  };
}
