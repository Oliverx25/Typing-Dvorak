import { useCallback, useEffect, useRef, useState } from 'react';

const PROGRAMMATIC_SCROLL_MS = 650;

/**
 * Tracks which child is centered in a horizontal scroll container.
 * Uses manual scrollLeft centering so cards can be navigated in both directions.
 */
export function useScrollSnapCenter(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const programmaticScrollRef = useRef(false);
  const programmaticTimerRef = useRef<number | null>(null);

  const setItemRef = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      itemRefs.current[index] = element;
    },
    [],
  );

  const centerItem = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const root = scrollRef.current;
    const item = itemRefs.current[index];
    if (!root || !item) return;

    const rootRect = root.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const targetLeft =
      root.scrollLeft +
      (itemRect.left - rootRect.left) -
      (rootRect.width - itemRect.width) / 2;

    root.scrollTo({
      left: Math.max(0, Math.min(targetLeft, root.scrollWidth - root.clientWidth)),
      behavior,
    });
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= itemCount) return;

      setActiveIndex(index);

      if (programmaticTimerRef.current !== null) {
        window.clearTimeout(programmaticTimerRef.current);
      }
      programmaticScrollRef.current = true;
      centerItem(index, 'smooth');
      programmaticTimerRef.current = window.setTimeout(() => {
        programmaticScrollRef.current = false;
        programmaticTimerRef.current = null;
        centerItem(index, 'auto');
      }, PROGRAMMATIC_SCROLL_MS);
    },
    [centerItem, itemCount],
  );

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || itemCount <= 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScrollRef.current) return;

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
      { root, threshold: [0.4, 0.55, 0.7, 0.85, 1] },
    );

    for (const element of itemRefs.current) {
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [itemCount]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || itemCount <= 1) return;

    let scrollEndTimer: number | null = null;

    const snapToNearest = () => {
      if (programmaticScrollRef.current) return;

      const rootRect = root.getBoundingClientRect();
      const centerX = rootRect.left + rootRect.width / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      for (let i = 0; i < itemRefs.current.length; i += 1) {
        const item = itemRefs.current[i];
        if (!item) continue;
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(itemCenter - centerX);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      setActiveIndex(closestIndex);
      centerItem(closestIndex, 'smooth');
    };

    const onScroll = () => {
      if (programmaticScrollRef.current) return;
      if (scrollEndTimer !== null) window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        scrollEndTimer = null;
        snapToNearest();
      }, 120);
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      root.removeEventListener('scroll', onScroll);
      if (scrollEndTimer !== null) window.clearTimeout(scrollEndTimer);
    };
  }, [centerItem, itemCount]);

  useEffect(() => {
    return () => {
      if (programmaticTimerRef.current !== null) {
        window.clearTimeout(programmaticTimerRef.current);
      }
    };
  }, []);

  return { scrollRef, setItemRef, activeIndex, scrollToIndex, centerItem };
};
