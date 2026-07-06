import { useCallback, useEffect, useRef, useState } from 'react';
import { TELEPROMPTER_ACTIVE_LINE_ROW } from '@/utils/typing/teleprompterConfig';

export {
  TELEPROMPTER_ACTIVE_LINE_ROW,
  TELEPROMPTER_TEXT_CLASS,
  TELEPROMPTER_VIEWPORT_CLASS,
  TELEPROMPTER_VISIBLE_LINES,
} from '@/utils/typing/teleprompterConfig';

interface UseTeleprompterScrollOptions {
  activeIndex: number;
  textLength: number;
}

/**
 * Tracks the active character and returns a translateY offset so the current
 * line stays on the second visual row (one line of context above). Uses DOM
 * measurement + CSS transform (no scrollTop / no React re-render loop).
 *
 * Camera follows the real player cursor only — never pacer or ghost indices.
 */
export function useTeleprompterScroll({ activeIndex, textLength }: UseTeleprompterScrollOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);

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
    const measuredLineHeight = textBlock
      ? parseFloat(getComputedStyle(textBlock).lineHeight)
      : active.getBoundingClientRect().height;

    const contextOffset = measuredLineHeight * (TELEPROMPTER_ACTIVE_LINE_ROW - 1);
    const activeTop = active.getBoundingClientRect().top;
    const innerTop = inner.getBoundingClientRect().top;
    setLineHeight(measuredLineHeight);
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

  return { viewportRef, innerRef, assignActiveRef, offsetY, lineHeight };
}

