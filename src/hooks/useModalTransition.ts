import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getModalTransitionMs,
  modalBackdropClass,
  modalDialogClass,
  modalPanelClass,
} from '@/utils/modal/modalAnimation';

/** Delays `onClose` until exit animation finishes. */
export function useModalTransition(onClose: () => void) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    const durationMs = getModalTransitionMs();
    if (durationMs === 0) {
      onClose();
      return;
    }
    closingRef.current = true;
    setClosing(true);
    timerRef.current = window.setTimeout(() => {
      closingRef.current = false;
      onClose();
    }, durationMs);
  }, [onClose]);

  return {
    closing,
    requestClose,
    backdropClassName: modalBackdropClass(closing),
    panelClassName: modalPanelClass(closing),
    dialogClassName: modalDialogClass(closing),
  };
}
