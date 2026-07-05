interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
}: ToggleSwitchProps) {
  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-[var(--color-highlight)]' : 'bg-[var(--color-border)]',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );

  if (!label) return control;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-[var(--color-text)]">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      {control}
    </div>
  );
}
