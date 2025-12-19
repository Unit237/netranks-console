import React from "react";

interface LoadingProgressBarProps {
  progress: number;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingProgressBar: React.FC<LoadingProgressBarProps> = ({
  progress,
  message = "Loading questions...",
  fullScreen = true,
  className = "",
}) => {
  const content = (
    <div className={`flex flex-col items-center gap-4 w-full max-w-md px-4 ${className}`}>
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {Math.round(progress)}%
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingProgressBar;
