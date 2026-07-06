import { useEffect, useRef } from 'react';
import type { CaretAnimation, CaretStyle } from '@/utils/app/settings';

interface TypingCaretProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  caretStyle: CaretStyle;
  caretAnimation: CaretAnimation;
  visible: boolean;
  positionKey?: number;
}

function applyCaretGeometry(
  el: HTMLSpanElement,
  anchor: HTMLElement,
  caretStyle: CaretStyle,
): void {
  const rect = anchor.getBoundingClientRect();
  const parent = anchor.offsetParent as HTMLElement | null;
  const parentRect = parent?.getBoundingClientRect();
  const left = parentRect ? rect.left - parentRect.left : rect.left;
  const top = parentRect ? rect.top - parentRect.top : rect.top;
  const isUnderline = caretStyle === 'underline';
  const isBlock = caretStyle === 'block';

  el.style.transform = `translate(${left}px, ${top + (isUnderline ? rect.height - 2 : 0)}px)`;
  el.style.width = isBlock ? `${rect.width}px` : isUnderline ? `${rect.width}px` : '';
  el.style.height = isUnderline ? '2px' : `${rect.height}px`;
}

export default function TypingCaret({
  anchorRef,
  caretStyle,
  caretAnimation,
  visible,
  positionKey = 0,
}: TypingCaretProps) {
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = caretRef.current;
    if (!el) return;

    if (!visible) {
      el.style.display = 'none';
      return;
    }

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) {
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      applyCaretGeometry(el, anchor, caretStyle);
    };

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef, visible, positionKey, caretStyle]);

  if (!visible) return null;

  const motionClasses =
    caretAnimation === 'smooth'
      ? 'transition-transform duration-100 ease-out'
      : caretAnimation === 'blink'
        ? 'caret-blink motion-reduce:animate-none'
        : '';

  const isUnderline = caretStyle === 'underline';
  const isBlock = caretStyle === 'block';

  return (
    <span
      ref={caretRef}
      aria-hidden="true"
      className={[
        'pointer-events-none absolute z-20',
        isBlock
          ? 'border border-[var(--color-key-target)]/50 bg-[var(--color-key-target)]/25'
          : isUnderline
            ? 'h-0.5 bg-[var(--color-key-target)]'
            : 'w-0.5 bg-[var(--color-key-target)]',
        motionClasses,
      ].join(' ')}
    />
  );
}
