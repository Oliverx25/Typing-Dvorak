import { useEffect, useRef, useState } from 'react';
import { getBestWpmForLesson } from '../utils/progress/storage';
import { pacingCursorIndex } from '../utils/typing/pacingCursor';

interface UsePacingCursorsOptions {
  started: boolean;
  finished: boolean;
  paused: boolean;
  startTime: number | null;
  totalChars: number;
  lessonId: string;
  pacerEnabled: boolean;
  pacerTargetWpm: number;
  ghostEnabled: boolean;
}

interface PacingCursorsState {
  pacerIndex: number | null;
  ghostIndex: number | null;
}

/**
 * Drives pacer (hare) and ghost cursors with requestAnimationFrame.
 * Both use the same WPM-based pacing math; ghost WPM is the lesson best
 * captured when the session starts.
 */
export function usePacingCursors({
  started,
  finished,
  paused,
  startTime,
  totalChars,
  lessonId,
  pacerEnabled,
  pacerTargetWpm,
  ghostEnabled,
}: UsePacingCursorsOptions): PacingCursorsState {
  const [state, setState] = useState<PacingCursorsState>({ pacerIndex: null, ghostIndex: null });
  const [ghostWpm, setGhostWpm] = useState<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!started) {
      setGhostWpm(null);
      return;
    }
    const best = getBestWpmForLesson(lessonId);
    setGhostWpm(best && best > 0 ? best : null);
  }, [started, lessonId]);
  const active = started && !finished && !paused && startTime !== null;
  const runGhost = ghostEnabled && ghostWpm !== null && ghostWpm > 0;

  useEffect(() => {
    if (!active || (!pacerEnabled && !runGhost)) {
      setState({ pacerIndex: null, ghostIndex: null });
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - (startTime as number);

      const pacerIndex = pacerEnabled
        ? pacingCursorIndex(elapsed, pacerTargetWpm, totalChars)
        : null;

      const ghostIndex = runGhost
        ? pacingCursorIndex(elapsed, ghostWpm as number, totalChars)
        : null;

      setState((prev) =>
        prev.pacerIndex === pacerIndex && prev.ghostIndex === ghostIndex
          ? prev
          : { pacerIndex, ghostIndex },
      );

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [active, pacerEnabled, runGhost, pacerTargetWpm, ghostWpm, totalChars, startTime]);

  return state;
}
