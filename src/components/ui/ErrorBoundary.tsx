"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

// ─────────────────────────────────────────────
// ErrorBoundary — catches render errors per route
// so a single broken component can't take down
// the entire app shell.
// Must be a class component — hooks can't do this.
// ─────────────────────────────────────────────

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      const title = this.props.fallbackTitle ?? "Something went wrong";

      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
            <AlertTriangle
              size={22}
              className="text-[var(--color-danger)]"
              strokeWidth={1.5}
            />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {title}
            </p>
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {this.state.error.message}
            </p>
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="flex items-center gap-1.5 text-xs text-[var(--color-brand)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] rounded"
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
