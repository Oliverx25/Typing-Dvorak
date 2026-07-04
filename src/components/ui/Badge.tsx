import type { ReactNode } from 'react';

type BadgeVariant = 'accent' | 'muted' | 'success' | 'warning' | 'locked' | 'target';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT: Record<BadgeVariant, string> = {
  accent: 'bg-[var(--color-highlight)]/10 text-[var(--color-highlight)]',
  muted: 'bg-[var(--color-border)] text-[var(--color-text-muted)]',
  success: 'bg-[var(--color-correct)]/10 text-[var(--color-correct)]',
  warning: 'bg-[var(--color-key-target)]/15 text-[var(--color-key-target)]',
  locked: 'bg-[var(--color-border)] text-[var(--color-text-muted)]',
  target: 'bg-[var(--color-key-target)]/15 text-[var(--color-key-target)]',
};

export default function Badge({ children, variant = 'accent', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANT[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
