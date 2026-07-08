import type { RefObject } from 'react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useModalTransition } from '@/hooks/useModalTransition';
import { useOverlayModal } from '@/hooks/useOverlayModal';

interface UseModalOverlayOptions {
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
}

/** Enter/exit animation + focus trap + body scroll lock for div-based modals. */
export function useModalOverlay({
  onClose,
  returnFocusRef,
  lockScroll = true,
}: UseModalOverlayOptions) {
  const { closing, requestClose, backdropClassName, panelClassName } = useModalTransition(onClose);
  const { panelRef } = useOverlayModal({ onClose: requestClose, returnFocusRef });

  useLockBodyScroll(lockScroll);

  return {
    closing,
    requestClose,
    panelRef,
    backdropClassName,
    panelClassName,
  };
}
