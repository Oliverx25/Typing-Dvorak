import type { ReactNode } from 'react';

const FEATHERED_MASK_STYLE = {
  WebkitMaskImage:
    'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
  maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
} as const;

const SHELL_LAYOUT = 'mx-auto w-[95vw] max-w-7xl';
const INNER_PAD = 'px-8 sm:px-16';

interface PracticeTeleprompterShellProps {
  children: ReactNode;
  /** Idle placeholder vs active TypingTest session. */
  variant: 'idle' | 'active';
  className?: string;
}

/**
 * Practice-only wrapper for feathered teleprompter edges.
 * Strips bordered teleprompter chrome via parent selectors — does not alter shared prompter internals.
 */
export default function PracticeTeleprompterShell({
  children,
  variant,
  className = '',
}: PracticeTeleprompterShellProps) {
  if (variant === 'active') {
    return (
      <div
        className={[
          SHELL_LAYOUT,
          '[&_[role=textbox]]:border-transparent',
          '[&_[role=textbox]]:bg-transparent',
          '[&_[role=textbox]]:shadow-none',
          '[&_[role=textbox]]:ring-0',
          '[&_[role=textbox]]:p-0',
          '[&_[role=textbox]]:px-8',
          '[&_[role=textbox]]:sm:px-16',
          '[&_[role=textbox]:focus]:border-transparent',
          '[&_[role=textbox]:focus]:ring-0',
          '[&_[role=textbox]>div:first-child]:hidden',
          '[&_[role=textbox]]:[mask-image:linear-gradient(to_right,transparent_0%,black_2%,black_98%,transparent_100%)]',
          '[&_[role=textbox]]:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_2%,black_98%,transparent_100%)]',
          className,
        ].join(' ')}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={[SHELL_LAYOUT, className].join(' ')} style={FEATHERED_MASK_STYLE}>
      <div className={INNER_PAD}>{children}</div>
    </div>
  );
}
