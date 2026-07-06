import { useEffect, useRef, type RefObject } from 'react';

interface UseOverlayModalOptions {
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Escape-to-close and focus restore for div-based modal overlays. */
export function useOverlayModal({ onClose, returnFocusRef }: UseOverlayModalOptions) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const returnTarget = returnFocusRef?.current ?? (document.activeElement as HTMLElement | null);
    returnFocusTargetRef.current = returnTarget;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const focusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const target = returnFocusRef?.current ?? returnFocusTargetRef.current;
      if (target?.isConnected) {
        requestAnimationFrame(() => target.focus());
      }
    };
  }, [onClose, returnFocusRef]);

  return { panelRef };
}
