import React from "react";
import type { Toast } from "react-hot-toast";

interface SurveyCreatedToastProps {
  t: Toast;
  title?: string;
  onView: () => void;
}

export const SurveyCreatedToast: React.FC<SurveyCreatedToastProps> = ({
  t,
  title = "Survey created successfully",
  onView,
}) => {
  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md pointer-events-auto rounded-[20px] bg-black shadow-lg ring-1 ring-black ring-opacity-5`}
      style={{
        animation: t.visible
          ? "slideInUp 0.3s ease-out"
          : "slideOutDown 0.2s ease-in",
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div className="ml-3">
              <p className="text-sm font-medium text-white">{title}</p>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={onView}
            className="ml-4 rounded-[20px] bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};
