import { useEffect, useRef, useState, type RefObject } from 'react';

/** True when the element sits in the vertical center band of a scroll-snap carousel. */
export function useCarouselCentered(scrollRootRef: RefObject<HTMLElement | null>) {
  const itemRef = useRef<HTMLElement>(null);
  const [isCentered, setIsCentered] = useState(false);

  useEffect(() => {
    const root = scrollRootRef.current;
    const item = itemRef.current;
    if (!root || !item) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCentered(entry.isIntersecting);
      },
      {
        root,
        rootMargin: '-42% 0px -42% 0px',
        threshold: 0,
      },
    );

    observer.observe(item);
    return () => observer.disconnect();
  }, [scrollRootRef]);

  return { itemRef, isCentered };
}
