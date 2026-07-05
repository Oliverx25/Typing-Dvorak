import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks which child is centered in a horizontal scroll container (CSS snap + IO).
 */
export function useScrollSnapCenter(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const setItemRef = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      itemRefs.current[index] = element;
    },
    [],
  );

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || itemCount <= 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.snapIndex);
          if (Number.isNaN(index)) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        }

        if (bestIndex >= 0) {
          setActiveIndex(bestIndex);
        }
      },
      { root, threshold: [0.35, 0.5, 0.65, 0.85, 1] },
    );

    for (const element of itemRefs.current) {
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [itemCount]);

  const scrollToIndex = useCallback((index: number) => {
    itemRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, []);

  return { scrollRef, setItemRef, activeIndex, scrollToIndex };
}
