import { useCallback, useEffect, useState } from 'react';

interface UseListKeyboardNavOptions {
  itemCount: number;
  enabled: boolean;
  onActivate: (index: number) => void;
}

/** Arrow keys + Enter navigation for vertical lists (search results, menus). */
export function useListKeyboardNav({
  itemCount,
  enabled,
  onActivate,
}: UseListKeyboardNavOptions) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled || itemCount === 0) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((prev) => {
      if (prev < 0) return 0;
      return Math.min(prev, itemCount - 1);
    });
  }, [enabled, itemCount]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled || itemCount === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % itemCount);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + itemCount) % itemCount);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setActiveIndex(0);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setActiveIndex(itemCount - 1);
        return;
      }

      if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        onActivate(activeIndex);
      }
    },
    [activeIndex, enabled, itemCount, onActivate],
  );

  return { activeIndex, onKeyDown, setActiveIndex };
}
