import { createPortal } from 'react-dom';
import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';

interface HeaderMenuPortalProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  widthClassName?: string;
  menuClassName?: string;
}

/** Renders header dropdowns in a portal so sticky/backdrop-filter ancestors cannot block clicks. */
export default function HeaderMenuPortal({
  open,
  onClose,
  anchorRef,
  children,
  widthClassName = 'w-72',
  menuClassName = '',
}: HeaderMenuPortalProps) {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorRef]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[200]" onClick={onClose} aria-hidden="true" />
      <div
        className={[
          'fixed z-[201] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-xl',
          widthClassName,
          menuClassName,
        ].join(' ')}
        style={{ top: position.top, right: position.right }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
