"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ChartErrorBoundary extends React.Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chart Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-muted rounded-lg bg-muted/20">
          <AlertTriangle className="size-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Chart temporarily unavailable
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="gap-2"
          >
            <RefreshCw className="size-3" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
