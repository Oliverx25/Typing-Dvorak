import { Button, Icon } from '@/components/ui';

interface NetworkEmptyStateProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  compact?: boolean;
}

/** Minimal empty / error state for network-dependent UI with a retry action. */
export default function NetworkEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: NetworkEmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center text-center',
        compact ? 'px-4 py-8' : 'px-6 py-10',
      ].join(' ')}
      role="status"
    >
      <div
        className="mb-3 flex size-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        <Icon name="refresh" size={18} />
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--color-text-muted)]">
          {description}
        </p>
      ) : null}
      <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
