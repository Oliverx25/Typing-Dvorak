import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * True when the card sits in the top focus band of a scroll-snap carousel.
 * `defaultActive` ensures index 0 is highlighted on first paint (scrollTop === 0).
 */
export function useCarouselTopFocus(
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
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      },
    );

    observer.observe(item);

    const syncAtTop = () => {
      if (defaultActive && root.scrollTop <= 4) {
        setIsActive(true);
      }
    };

    syncAtTop();
    root.addEventListener('scroll', syncAtTop, { passive: true });

    return () => {
      observer.disconnect();
      root.removeEventListener('scroll', syncAtTop);
    };
  }, [scrollRootRef, defaultActive]);

  return { itemRef, isActive };
}
