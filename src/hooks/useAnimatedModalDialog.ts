import type { RefObject } from 'react';
import { useModalDialog } from '@/hooks/useModalDialog';
import { useModalTransition } from '@/hooks/useModalTransition';

interface UseAnimatedModalDialogOptions {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/** Native `<dialog>` with enter/exit animation before unmount. */
export function useAnimatedModalDialog({
  open,
  onClose,
  returnFocusRef,
}: UseAnimatedModalDialogOptions) {
  const { closing, requestClose, panelClassName, dialogClassName } = useModalTransition(onClose, open);
  const { dialogRef, handleDialogClose, handleCancel } = useModalDialog({
    open,
    onClose: requestClose,
    returnFocusRef,
  });

  return {
    dialogRef,
    handleDialogClose,
    handleCancel,
    closing,
    requestClose,
    panelClassName,
    dialogClassName,
  };
}
