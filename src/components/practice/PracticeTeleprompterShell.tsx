import type { ReactNode } from 'react';

const FEATHERED_MASK_STYLE = {
  WebkitMaskImage:
    'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
  maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
} as const;

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
          'mx-auto w-full max-w-4xl',
          '[&_[role=textbox]]:border-transparent',
          '[&_[role=textbox]]:bg-transparent',
          '[&_[role=textbox]]:shadow-none',
          '[&_[role=textbox]]:ring-0',
          '[&_[role=textbox]]:p-0',
          '[&_[role=textbox]:focus]:border-transparent',
          '[&_[role=textbox]:focus]:ring-0',
          '[&_[role=textbox]>div:first-child]:hidden',
          '[&_[role=textbox]]:[mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]',
          '[&_[role=textbox]]:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]',
          className,
        ].join(' ')}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={['mx-auto w-full max-w-4xl', className].join(' ')}
      style={FEATHERED_MASK_STYLE}
    >
      {children}
    </div>
  );
}
