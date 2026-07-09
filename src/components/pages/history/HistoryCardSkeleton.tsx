import { memo } from 'react';
import {
  spotlightInlineStyle,
  type SpotlightStyle,
} from '@/components/pages/history/historySpotlight';

interface HistoryCardSkeletonProps {
  spotlightStyle: SpotlightStyle;
  onMouseEnter: () => void;
}

function HistoryCardSkeleton({ spotlightStyle, onMouseEnter }: HistoryCardSkeletonProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      style={spotlightInlineStyle(spotlightStyle)}
      className="h-28 w-full animate-pulse rounded-xl border border-slate-200 bg-slate-100 transition-all duration-300 ease-out will-change-transform motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900/40"
      role="status"
      aria-hidden="true"
    />
  );
}

export default memo(HistoryCardSkeleton);
