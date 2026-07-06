import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryLabels {
  title: string;
  description: string;
  retry: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  labels: ErrorBoundaryLabels;
  fallback?: ReactNode;
  className?: string;
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Catches render errors in a subtree so the rest of the app keeps working. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.error && prevProps.resetKeys !== this.props.resetKeys) {
      this.setState({ error: null });
    }
  }

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback;

      const { labels, className = '' } = this.props;
      return (
        <div
          role="alert"
          className={[
            'rounded-xl border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/5 px-5 py-6 text-center',
            className,
          ].join(' ')}
        >
          <p className="text-sm font-semibold text-[var(--color-text)]">{labels.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
            {labels.description}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)]"
          >
            {labels.retry}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
