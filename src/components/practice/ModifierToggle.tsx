interface ModifierToggleProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export default function ModifierToggle({ active, label, onClick }: ModifierToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        'rounded-md px-2.5 py-1 text-xs font-medium lowercase tracking-wide transition-colors duration-200',
        active
          ? 'text-[var(--color-highlight)]'
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
