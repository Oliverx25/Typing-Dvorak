import type { ReactNode, ElementType } from 'react';

type CardVariant = 'default' | 'elevated' | 'dashed' | 'highlight' | 'muted';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  /**
   * Full-bleed body: header keeps its padding while `children` (tables, lists)
   * span edge-to-edge. Keeps edge-content cards consistent without manual hacks.
   */
  bleed?: boolean;
  as?: ElementType;
  href?: string;
  onClick?: () => void;
}

const VARIANT: Record<CardVariant, string> = {
  default: 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
  elevated: 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm',
  dashed: 'border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50',
  highlight: 'border-[var(--color-highlight)] ring-2 ring-[var(--color-highlight)]/20 bg-[var(--color-surface-elevated)]',
  muted: 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 opacity-60',
};

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

/** Header padding used when the body is full-bleed (matches PADDING but bottom-less). */
const BLEED_HEADER_PADDING: Record<CardPadding, string> = {
  none: 'px-6 pt-6',
  sm: 'px-4 pt-4',
  md: 'px-5 pt-5',
  lg: 'px-6 pt-6',
};

export default function Card({
  children,
  title,
  description,
  variant = 'default',
  padding = 'md',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  bleed = false,
  as: Tag = 'div',
  href,
  onClick,
}: CardProps) {
  const base = [
    'rounded-xl border transition-all duration-300 overflow-hidden',
    VARIANT[variant],
    bleed ? '' : PADDING[padding],
    className,
  ].join(' ');

  const hasHeader = Boolean(title || description);
  const headerPadding = bleed ? BLEED_HEADER_PADDING[padding] : '';

  const content = (
    <>
      {hasHeader && (
        <header className={['mb-4', headerPadding, headerClassName].join(' ')}>
          {title && <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>}
          {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
        </header>
      )}
      {bleed ? <div className={bodyClassName}>{children}</div> : children}
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
