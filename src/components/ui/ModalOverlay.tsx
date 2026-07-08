import { createContext, useContext, type ReactNode, type RefObject } from 'react';
import { useModalOverlay } from '@/hooks/useModalOverlay';

const ModalCloseContext = createContext<(() => void) | null>(null);

interface ModalOverlayProps {
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  labelledBy?: string;
  describedBy?: string;
  overlayClassName?: string;
  backdropClassName?: string;
  panelClassName?: string;
  lockScroll?: boolean;
  children: ReactNode;
}

export function useModalRequestClose(): () => void {
  const requestClose = useContext(ModalCloseContext);
  if (!requestClose) {
    throw new Error('useModalRequestClose must be used within ModalOverlay');
  }
  return requestClose;
}

export default function ModalOverlay({
  onClose,
  returnFocusRef,
  labelledBy,
  describedBy,
  overlayClassName = 'z-[70]',
  backdropClassName: backdropExtra = '',
  panelClassName = '',
  lockScroll = true,
  children,
}: ModalOverlayProps) {
  const { requestClose, panelRef, backdropClassName, panelClassName: panelAnimClassName } =
    useModalOverlay({ onClose, returnFocusRef, lockScroll });

  return (
    <ModalCloseContext.Provider value={requestClose}>
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 sm:p-6 ${overlayClassName}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${backdropClassName} ${backdropExtra}`}
          onClick={requestClose}
          aria-hidden="true"
        />
        <div ref={panelRef} className={`relative ${panelAnimClassName} ${panelClassName}`}>
          {children}
        </div>
      </div>
    </ModalCloseContext.Provider>
  );
}
