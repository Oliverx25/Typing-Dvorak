interface SettingsToggleProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export default function SettingsToggle({ active, label, onClick }: SettingsToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition',
        active
          ? 'border-[var(--color-highlight)] bg-[var(--color-highlight)]/15 text-[var(--color-highlight)]'
          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-highlight)]/40',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
