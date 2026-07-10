import { useLayoutEffect, useRef, useState } from 'react';

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export default function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeIndex = options.findIndex((option) => option.value === value);
    const buttons = container.querySelectorAll<HTMLElement>('[data-segment]');
    const activeButton = buttons[activeIndex];
    if (!activeButton) return;

    setIndicator({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    });
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={ariaLabel}
      className="relative flex items-center rounded-lg bg-slate-200/60 p-1 dark:bg-slate-800/40"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 top-1 rounded-md bg-white shadow-sm transition-all duration-200 ease-out dark:bg-slate-700/90"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            data-segment
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              'relative z-10 rounded-md px-3 py-1 text-xs font-medium lowercase tracking-wide transition-colors duration-200',
              active
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
