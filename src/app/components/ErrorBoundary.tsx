import React, { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      this.setState({ hasError: false, error: null });
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Reload Page
                  </button>
                  <button
                    onClick={() => {
                      this.setState({ hasError: false, error: null });
                      window.location.href = "/console";
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Go to Console
                  </button>
                </div>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                      Error Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-xs overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

