import type { ReactNode, ElementType } from 'react';

type CardVariant = 'default' | 'elevated' | 'dashed' | 'highlight' | 'muted';

interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  headerClassName?: string;
  as?: ElementType;
  href?: string;
  onClick?: () => void;
}

const VARIANT: Record<CardVariant, string> = {
  default: 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
  elevated: 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm',
  dashed: 'border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50',
  highlight: 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 bg-[var(--color-surface-elevated)]',
  muted: 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 opacity-60',
};

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({
  children,
  title,
  description,
  variant = 'default',
  padding = 'md',
  className = '',
  headerClassName = '',
  as: Tag = 'div',
  href,
  onClick,
}: CardProps) {
  const base = [
    'rounded-xl border transition',
    VARIANT[variant],
    PADDING[padding],
    className,
  ].join(' ');

  const content = (
    <>
      {(title || description) && (
        <header className={['mb-4', headerClassName].join(' ')}>
          {title && <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>}
          {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
        </header>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} className={[base, 'block no-underline'].join(' ')} onClick={onClick}>
        {content}
      </a>
    );
  }

  return <Tag className={base} onClick={onClick}>{content}</Tag>;
}
