import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { focusRingClassName } from '@/utils/a11y/focusRing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'highlight';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-highlight)] text-white shadow-lg shadow-[var(--color-highlight)]/20 hover:bg-[var(--color-highlight-hover)]',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)]',
  ghost:
    'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]',
  success:
    'bg-[var(--color-correct)] text-white shadow-lg shadow-[var(--color-correct)]/25 hover:brightness-110',
  highlight:
    'bg-[var(--color-highlight)] text-white shadow-lg shadow-[var(--color-highlight)]/25 hover:bg-[var(--color-highlight-hover)]',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40',
        focusRingClassName,
        VARIANT[variant],
        SIZE[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
