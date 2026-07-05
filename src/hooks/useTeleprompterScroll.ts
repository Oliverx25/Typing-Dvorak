import { useCallback, useEffect, useRef, useState } from 'react';

/** Visible lines in the teleprompter viewport. */
export const TELEPROMPTER_VISIBLE_LINES = 3;

/** Active line is pinned to this visual row (1 = top). Row 2 keeps one line of context above. */
export const TELEPROMPTER_ACTIVE_LINE_ROW = 2;

interface UseTeleprompterScrollOptions {
  activeIndex: number;
  textLength: number;
}

/**
 * Tracks the active character and returns a translateY offset so the current
 * line stays on the second visual row (one line of context above). Uses DOM
 * measurement + CSS transform (no scrollTop / no React re-render loop).
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

    const textBlock = active.closest('p');
    const lineHeight = textBlock
      ? parseFloat(getComputedStyle(textBlock).lineHeight)
      : active.getBoundingClientRect().height;

    const contextOffset = lineHeight * (TELEPROMPTER_ACTIVE_LINE_ROW - 1);
    const activeTop = active.getBoundingClientRect().top;
    const innerTop = inner.getBoundingClientRect().top;
    setOffsetY(Math.max(0, activeTop - innerTop - contextOffset));
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
