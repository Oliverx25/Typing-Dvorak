/** Shared Tailwind classes for text inputs and textareas — pairs with global.css form token rules. */
export const formFieldClassName =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15';

export const formFieldMonoClassName = `${formFieldClassName} resize-none font-mono`;

export const formFieldMonoResizableClassName = `${formFieldClassName} resize-y font-mono`;
