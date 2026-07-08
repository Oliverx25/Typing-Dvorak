import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getModalTransitionMs,
  modalBackdropClass,
  modalDialogClass,
  modalPanelClass,
} from '@/utils/modal/modalAnimation';

/** Delays `onClose` until exit animation finishes. Pass `open` when the modal stays mounted between opens. */
export function useModalTransition(onClose: () => void, open = true) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    if (!open) return;
    closingRef.current = false;
    setClosing(false);
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, [open]);

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
      setClosing(false);
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
