import { useCallback, useEffect, useRef, useState } from 'react';

/** Visible lines in the teleprompter viewport. */
export const TELEPROMPTER_VISIBLE_LINES = 3;

interface UseTeleprompterScrollOptions {
  activeIndex: number;
  textLength: number;
}

/**
 * Tracks the active character and returns a translateY offset so the current
 * line stays near the top of a fixed-height viewport. Uses DOM measurement +
 * CSS transform (no scrollTop / no React re-render loop).
 */
export function useTeleprompterScroll({ activeIndex, textLength }: UseTeleprompterScrollOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement | null>(null);
  const [offsetY, setOffsetY] = useState(0);

  const assignActiveRef = useCallback((el: HTMLSpanElement | null) => {
    activeRef.current = el;
  }, []);

  const measure = useCallback(() => {
    const active = activeRef.current;
    const inner = innerRef.current;
    if (!active || !inner) {
      setOffsetY(0);
      return;
    }

    const activeTop = active.getBoundingClientRect().top;
    const innerTop = inner.getBoundingClientRect().top;
    setOffsetY(Math.max(0, activeTop - innerTop));
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [activeIndex, textLength, measure]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [measure]);

  return { viewportRef, innerRef, assignActiveRef, offsetY };
}

export const TELEPROMPTER_TEXT_CLASS =
  'font-mono text-xl leading-[2] tracking-wide break-words sm:text-2xl sm:leading-[2.2]';

/** 3 lines: text-xl * leading-2 = 2.5rem/line; sm:text-2xl * leading-2.2 = 3.3rem/line */
export const TELEPROMPTER_VIEWPORT_CLASS = 'h-[7.5rem] sm:h-[9.9rem]';
