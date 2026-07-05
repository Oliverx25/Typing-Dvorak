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
  /**
   * Forced pacer WPM (the "musical hare"). When > 0 it overrides pacerEnabled/
   * pacerTargetWpm so the pacer follows the song cadence even in race mode.
   */
  musicPacerWpm?: number | null;
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
  musicPacerWpm = null,
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
  const useMusicPacer = musicPacerWpm !== null && musicPacerWpm > 0;
  const runPacer = useMusicPacer || pacerEnabled;
  const effectivePacerWpm = useMusicPacer ? (musicPacerWpm as number) : pacerTargetWpm;

  useEffect(() => {
    if (!active || (!runPacer && !runGhost)) {
      setState({ pacerIndex: null, ghostIndex: null });
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - (startTime as number);

      const pacerIndex = runPacer
        ? pacingCursorIndex(elapsed, effectivePacerWpm, totalChars)
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
  }, [active, runPacer, runGhost, effectivePacerWpm, ghostWpm, totalChars, startTime]);

  return state;
}
