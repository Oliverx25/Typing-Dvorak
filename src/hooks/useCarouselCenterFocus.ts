import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * True when the card sits in the CENTER band of a scroll-snap carousel.
 * Use with `snap-center` items.
 */
export function useCarouselCenterFocus(
  scrollRootRef: RefObject<HTMLElement | null>,
  defaultActive = false,
) {
  const itemRef = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(defaultActive);

  useEffect(() => {
    const root = scrollRootRef.current;
    const item = itemRef.current;
    if (!root || !item) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      {
        root,
        // Centered focus: only intersecting within the middle band.
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      },
    );

    observer.observe(item);
    return () => observer.disconnect();
  }, [scrollRootRef]);

  return { itemRef, isActive };
}

