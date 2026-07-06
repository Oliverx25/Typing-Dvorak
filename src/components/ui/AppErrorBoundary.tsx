import type { ReactNode } from 'react';
import { useApp } from '@/contexts/AppProvider';
import ErrorBoundary, { type ErrorBoundaryLabels } from '@/components/ui/ErrorBoundary';

export type ErrorBoundarySection = 'typing' | 'graph' | 'lobby' | 'generic';

interface AppErrorBoundaryProps {
  children: ReactNode;
  section?: ErrorBoundarySection;
  className?: string;
  resetKeys?: unknown[];
}

function labelsForSection(
  t: ReturnType<typeof useApp>['t'],
  section: ErrorBoundarySection,
): ErrorBoundaryLabels {
  switch (section) {
    case 'typing':
      return {
        title: t.errors.typingTitle,
        description: t.errors.typingDesc,
        retry: t.errors.boundaryRetry,
      };
    case 'graph':
      return {
        title: t.errors.graphTitle,
        description: t.errors.graphDesc,
        retry: t.errors.boundaryRetry,
      };
    case 'lobby':
      return {
        title: t.errors.lobbyTitle,
        description: t.errors.lobbyDesc,
        retry: t.errors.boundaryRetry,
      };
    default:
      return {
        title: t.errors.boundaryTitle,
        description: t.errors.boundaryDesc,
        retry: t.errors.boundaryRetry,
      };
  }
}

/** Error boundary with i18n labels from AppProvider. */
export default function AppErrorBoundary({
  children,
  section = 'generic',
  className,
  resetKeys,
}: AppErrorBoundaryProps) {
  const { t } = useApp();
  return (
    <ErrorBoundary labels={labelsForSection(t, section)} className={className} resetKeys={resetKeys}>
      {children}
    </ErrorBoundary>
  );
}
