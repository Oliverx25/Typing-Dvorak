import { useEffect, useId, useRef, useState } from 'react';
import Icon from '@/components/ui/icons/Icon';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
}

interface CustomDropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  'aria-label'?: string;
  className?: string;
}

export default function CustomDropdown<T extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  className = '',
}: CustomDropdownProps<T>) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={['relative', className].join(' ')}>
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-w-[10rem] items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-slate-500"
      >
        <span className="truncate">{selected?.label}</span>
        <Icon
          name="chevron-down"
          size={14}
          className={['shrink-0 text-slate-400 transition-transform', isOpen ? 'rotate-180' : ''].join(' ')}
        />
      </button>

      {isOpen ? (
        <ul
          role="listbox"
          aria-labelledby={id}
          className="absolute right-0 z-50 mt-1 min-w-full overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={[
                    'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition',
                    isSelected
                      ? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700',
                  ].join(' ')}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? (
                    <Icon name="check" size={14} strokeWidth={2.5} className="shrink-0 text-slate-500 dark:text-slate-300" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
