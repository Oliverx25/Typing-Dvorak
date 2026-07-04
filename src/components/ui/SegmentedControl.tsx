interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      className={[
        'flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1',
        className,
      ].join(' ')}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={[
              'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',
              isActive
                ? 'bg-[var(--color-highlight)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              disabled ? 'cursor-not-allowed opacity-50' : '',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
