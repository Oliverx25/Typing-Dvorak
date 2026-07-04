import { useEffect } from 'react';

/** Prevents background page scroll while a modal or overlay is open. */
export function useLockBodyScroll(active = true): void {
  useEffect(() => {
    if (!active) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}
