import { focusRingInsetClassName } from '@/utils/a11y/focusRing';

/** Shared styles for compact header controls — all use size-9 (36px) for alignment. */
export const headerIconButtonClassName = [
  'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0 leading-none text-[var(--color-text-muted)] transition-all duration-300 hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)]',
  focusRingInsetClassName,
].join(' ');

export const headerLinkClassName = [
  'inline-flex h-9 shrink-0 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 text-sm leading-none text-[var(--color-text-muted)] no-underline transition-all duration-300 hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)]',
  focusRingInsetClassName,
].join(' ');

/** Compact text-only nav links for the app header. */
export const headerNavLinkClassName = [
  'inline-flex h-9 shrink-0 items-center px-2 text-sm font-medium leading-none text-[var(--color-text-muted)] no-underline transition-colors duration-200 hover:text-[var(--color-highlight)]',
  focusRingInsetClassName,
].join(' ');

export const headerDividerClassName = 'mx-0.5 h-6 w-px shrink-0 bg-[var(--color-border)]';

export const headerAvatarButtonClassName = [
  'relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-highlight)]/20 p-0 leading-none transition-all duration-300 hover:border-[var(--color-highlight)]',
  focusRingInsetClassName,
].join(' ');
