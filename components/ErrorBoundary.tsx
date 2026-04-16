"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="border-2 border-border bg-surface p-4 sm:p-8">
            <p className="text-text-muted text-xs tracking-wide">
              [ERROR — Content failed to load]
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
