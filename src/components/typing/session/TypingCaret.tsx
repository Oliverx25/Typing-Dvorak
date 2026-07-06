import { useEffect, useState } from 'react';
import type { CaretAnimation, CaretStyle } from '@/utils/app/settings';

interface TypingCaretProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  caretStyle: CaretStyle;
  caretAnimation: CaretAnimation;
  visible: boolean;
  positionKey?: number;
}

export default function TypingCaret({
  anchorRef,
  caretStyle,
  caretAnimation,
  visible,
  positionKey = 0,
}: TypingCaretProps) {
  const [pos, setPos] = useState<{ left: number; top: number; width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    if (!visible) {
      setPos(null);
      return;
    }

    const update = () => {
      const el = anchorRef.current;
      if (!el) {
        setPos(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      const parent = el.offsetParent as HTMLElement | null;
      const parentRect = parent?.getBoundingClientRect();
      setPos({
        left: parentRect ? rect.left - parentRect.left : rect.left,
        top: parentRect ? rect.top - parentRect.top : rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    update();
    const id = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef, visible, positionKey]);

  if (!visible || !pos) return null;

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
      style={{
        transform: `translate(${pos.left}px, ${pos.top + (isUnderline ? pos.height - 2 : 0)}px)`,
        width: isBlock ? pos.width : isUnderline ? pos.width : undefined,
        height: isUnderline ? 2 : pos.height,
      }}
    />
  );
}
