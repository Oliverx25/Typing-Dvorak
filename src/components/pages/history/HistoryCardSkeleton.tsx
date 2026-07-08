import { memo } from 'react';

interface HistoryCardSkeletonProps {
  /** Slightly higher opacity for the centered loading placeholder. */
  emphasis?: boolean;
}

function HistoryCardSkeleton({ emphasis = false }: HistoryCardSkeletonProps) {
  return (
    <div
      className={[
        'snap-center h-28 w-full animate-pulse rounded-xl border border-slate-800 bg-slate-900/40',
        emphasis ? 'opacity-100' : 'opacity-60',
      ].join(' ')}
      role="status"
      aria-hidden="true"
    />
  );
}

export default memo(HistoryCardSkeleton);

