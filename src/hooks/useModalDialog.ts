import { useCallback, useEffect, useRef, type RefObject } from 'react';

interface UseModalDialogOptions {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/** Syncs a native `<dialog>` with React `open` state and restores focus on close. */
export function useModalDialog({ open, onClose, returnFocusRef }: UseModalDialogOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      returnFocusTargetRef.current =
        returnFocusRef?.current ?? (document.activeElement as HTMLElement | null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, returnFocusRef]);

  useEffect(() => {
    if (open) return;

    const target = returnFocusRef?.current ?? returnFocusTargetRef.current;
    if (target?.isConnected) {
      requestAnimationFrame(() => target.focus());
    }
  }, [open, returnFocusRef]);

  const handleDialogClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      onClose();
    },
    [onClose],
  );

  return { dialogRef, handleDialogClose, handleCancel };
}
