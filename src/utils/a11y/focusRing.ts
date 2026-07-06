/** Consistent keyboard focus ring — uses theme accent for dark/light surfaces. */
export const focusRingClassName =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]';

/** Compact ring for icon buttons and dense UI (no offset). */
export const focusRingInsetClassName =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/90';

/** Interactive cards and list options. */
export const focusRingCardClassName =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-elevated)]';
