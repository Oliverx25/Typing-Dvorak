import type { ReactNode } from 'react';

type StatCardVariant = 'default' | 'highlight' | 'accent' | 'success' | 'active' | 'urgent';

interface StatCardProps {
  label: string;
  value: string;
  variant?: StatCardVariant;
  size?: 'md' | 'lg';
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<StatCardVariant, string> = {
  default: 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
  highlight: 'border-[var(--color-correct)]/30 bg-[var(--color-correct)]/8',
  accent: 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
  success: 'border-[var(--color-correct)]/40 bg-[var(--color-correct)]/5',
  active: 'border-[var(--color-accent)]/30 bg-[var(--color-surface-elevated)] shadow-sm',
  urgent: 'border-[var(--color-incorrect)]/50 bg-[var(--color-incorrect)]/5 animate-pulse motion-reduce:animate-none',
};

const VALUE_CLASSES: Record<StatCardVariant, string> = {
  default: 'text-[var(--color-text)]',
  highlight: 'text-[var(--color-correct)]',
  accent: 'text-[var(--color-accent)]',
  success: 'text-[var(--color-correct)]',
  active: 'text-[var(--color-text)]',
  urgent: 'text-[var(--color-incorrect)]',
};

/** Reusable metric pill — stats bar, dashboard, and completion modal. */
export default function StatCard({
  label,
  value,
  variant = 'default',
  size = 'md',
  icon,
}: StatCardProps) {
  const padding = size === 'lg' ? 'px-2 py-3 sm:px-3' : 'sm:px-4 sm:py-4';
  const valueSize = size === 'lg' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';
  const surface = variant === 'highlight' ? 'bg-[var(--color-surface)]' : '';

  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl border px-3 py-3 text-center transition-all duration-300',
        padding,
        VARIANT_CLASSES[variant],
        surface,
      ].join(' ')}
    >
      {variant === 'active' && (
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse motion-reduce:animate-none" />
      )}
      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)] sm:text-xs">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-center gap-2">
        <p className={['font-mono font-bold', valueSize, VALUE_CLASSES[variant]].join(' ')}>{value}</p>
        {icon}
      </div>
    </div>
  );
}
