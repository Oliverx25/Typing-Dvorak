import { useEffect } from 'react';

const ZEN_CLASS = 'zen-active';

/**
 * Toggles the global `zen-active` body class so chrome marked with
 * `data-zen-fade` fades out while the user is actively typing. Restores the
 * chrome on pause/finish and on unmount.
 */
export function useZenMode(enabled: boolean, active: boolean): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const shouldHide = enabled && active;
    document.body.classList.toggle(ZEN_CLASS, shouldHide);

    return () => {
      document.body.classList.remove(ZEN_CLASS);
    };
  }, [enabled, active]);
}
