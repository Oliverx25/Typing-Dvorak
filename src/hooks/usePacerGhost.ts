import { useEffect, useRef, useState } from 'react';
import { ghostIndexAt, type ReplayData } from '../utils/typing/ghostReplay';

interface UsePacerGhostOptions {
  started: boolean;
  finished: boolean;
  paused: boolean;
  startTime: number | null;
  totalChars: number;
  pacerEnabled: boolean;
  pacerTargetWpm: number;
  ghostEnabled: boolean;
  ghostReplay: ReplayData | null;
}

interface PacerGhostState {
  pacerIndex: number | null;
  ghostIndex: number | null;
}

/** Standard WPM assumes 5 characters per word. */
const CHARS_PER_WORD = 5;

/**
 * Drives the pacer (hare) and ghost cursors with requestAnimationFrame while a
 * session is active. Returns the current char index each cursor should sit on.
 */
export function usePacerGhost({
  started,
  finished,
  paused,
  startTime,
  totalChars,
  pacerEnabled,
  pacerTargetWpm,
  ghostEnabled,
  ghostReplay,
}: UsePacerGhostOptions): PacerGhostState {
  const [state, setState] = useState<PacerGhostState>({ pacerIndex: null, ghostIndex: null });
  const frameRef = useRef<number | null>(null);

  const active = started && !finished && !paused && startTime !== null;
  const runGhost = ghostEnabled && !!ghostReplay && ghostReplay.length > 0;

  useEffect(() => {
    if (!active || (!pacerEnabled && !runGhost)) {
      setState({ pacerIndex: null, ghostIndex: null });
      return;
    }

    const charsPerMs = (pacerTargetWpm * CHARS_PER_WORD) / 60000;

    const tick = () => {
      const elapsed = Date.now() - (startTime as number);

      const pacerIndex = pacerEnabled
        ? Math.min(totalChars, Math.floor(elapsed * charsPerMs))
        : null;

      const ghostIndex = runGhost
        ? Math.min(totalChars, ghostIndexAt(ghostReplay as ReplayData, elapsed))
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
  }, [active, pacerEnabled, runGhost, pacerTargetWpm, totalChars, startTime, ghostReplay]);

  return state;
}
