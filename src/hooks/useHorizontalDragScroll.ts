import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const DRAG_THRESHOLD_PX = 6;

interface PointerState {
  startX: number;
  scrollLeft: number;
}

/** Enables click-and-drag horizontal scrolling for overflow containers (desktop-friendly). */
export function useHorizontalDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const pointerState = useRef<PointerState>({ startX: 0, scrollLeft: 0 });
  const didDragRef = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const onPointerDown = useCallback((event: ReactPointerEvent<T>) => {
    if (event.button !== 0) return;
    const element = ref.current;
    if (!element) return;

    didDragRef.current = false;
    pointerState.current = {
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
    };
    setIsGrabbing(true);
    element.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<T>) => {
    const element = ref.current;
    if (!element || event.buttons !== 1) return;

    const deltaX = event.clientX - pointerState.current.startX;
    if (!didDragRef.current && Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
    }

    if (didDragRef.current) {
      element.scrollLeft = pointerState.current.scrollLeft - deltaX;
    }
  }, []);

  const endDrag = useCallback((event: ReactPointerEvent<T>) => {
    const element = ref.current;
    if (element?.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
    setIsGrabbing(false);
  }, []);

  const shouldSuppressClick = useCallback(() => {
    if (!didDragRef.current) return false;
    didDragRef.current = false;
    return true;
  }, []);

  return {
    ref,
    isGrabbing,
    shouldSuppressClick,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
