import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';

interface HeaderMenuPortalProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  widthClassName?: string;
  menuClassName?: string;
}

/** Fixed-position overlay menus — avoids react-dom/createPortal and stale chunk issues. */
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

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200]" onClick={onClose} aria-hidden="true" />
      <div
        className={[
          'modal-enter fixed z-[201] origin-top rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-xl',
          widthClassName,
          menuClassName,
        ].join(' ')}
        style={{ top: position.top, right: position.right }}
      >
        {children}
      </div>
    </>
  );
}
