import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icons/Icon';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  'aria-label'?: string;
}

const triggerClassName =
  'flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-left text-sm text-[var(--color-text)] outline-none transition hover:border-[var(--color-text-muted)]/40 focus:border-[var(--color-highlight)] focus:ring-2 focus:ring-[var(--color-highlight)]/15 disabled:cursor-not-allowed disabled:opacity-50';

export default function CustomSelect({
  id: idProp,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select…',
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((option) => option.value === value);
  const selectedIndex = options.findIndex((option) => option.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, []);

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      close();
      triggerRef.current?.focus();
    },
    [close, onChange],
  );

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightIndex((prev) => {
          const next = prev < options.length - 1 ? prev + 1 : 0;
          return next;
        });
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightIndex((prev) => {
          const next = prev > 0 ? prev - 1 : options.length - 1;
          return next;
        });
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        if (highlightIndex >= 0 && options[highlightIndex]) {
          event.preventDefault();
          selectOption(options[highlightIndex].value);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, highlightIndex, open, options, selectOption]);

  useEffect(() => {
    if (open) {
      setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || highlightIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex, open]);

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
        className={triggerClassName}
      >
        <span className={selected ? 'truncate' : 'truncate text-[var(--color-text-muted)]'}>
          {selected?.label ?? placeholder}
        </span>
        <Icon
          name="chevron-down"
          size={18}
          className={[
            'shrink-0 text-[var(--color-text-muted)] transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-[200]" onClick={close} aria-hidden="true" />
          <ul
            ref={listRef}
            role="listbox"
            aria-labelledby={id}
            className="fixed z-[201] max-h-60 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-xl"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightIndex;

              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => selectOption(option.value)}
                    className={[
                      'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition',
                      isSelected
                        ? 'bg-[var(--color-highlight)]/15 text-[var(--color-text)]'
                        : isHighlighted
                          ? 'bg-[var(--color-highlight)]/10 text-[var(--color-text)]'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-highlight)]/10',
                    ].join(' ')}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-[var(--color-highlight)]"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="w-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </>
  );
}
