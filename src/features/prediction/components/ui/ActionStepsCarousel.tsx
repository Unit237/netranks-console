import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PriorityAction {
  action: string;
  current_state?: string;
  target_state?: string;
  estimated_improvement?: string;
  effort?: string;
  impact?: string;
  quick_tip?: string;
  // Alternative structure from API
  priority?: string;
  title?: string;
  details?: {
    current: string;
    target: string;
    improvement: string;
    effort: string;
  };
}

interface ActionStepsCarouselProps {
  actions: PriorityAction[];
}

const ActionStepsCarousel: React.FC<ActionStepsCarouselProps> = ({ actions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!actions || actions.length === 0) return null;

  // Normalize action data to handle both API and component formats
  const normalizedActions = actions.map(action => ({
    action: action.action || action.title || '',
    current_state: action.current_state || action.details?.current || '',
    target_state: action.target_state || action.details?.target || '',
    estimated_improvement: action.estimated_improvement || action.details?.improvement || '',
    effort: action.effort || action.details?.effort || '',
    impact: action.impact || action.priority || 'Medium',
    quick_tip: action.quick_tip
  }));

  const nextAction = () => {
    setCurrentIndex((prev) => (prev + 1) % normalizedActions.length);
  };

  const prevAction = () => {
    setCurrentIndex((prev) => (prev - 1 + normalizedActions.length) % normalizedActions.length);
  };

  const getPriorityColor = (impact: string) => {
    const impactLower = impact.toLowerCase();
    if (impactLower.includes('high')) {
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700';
    } else if (impactLower.includes('medium')) {
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700';
    } else if (impactLower.includes('low')) {
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700';
    }
    return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700'; // Default to green
  };

  const currentAction = normalizedActions[currentIndex];

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Action Steps
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{currentIndex + 1}</span>
              <span>of</span>
              <span>{normalizedActions.length}</span>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevAction}
              disabled={normalizedActions.length <= 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextAction}
              disabled={normalizedActions.length <= 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Card */}
        <div className="space-y-4">
          {/* Priority and Impact */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Priority #{currentIndex + 1}
            </div>
            <div className={`text-xs px-3 py-1 rounded-full border font-medium ${getPriorityColor(currentAction.impact)}`}>
              {currentAction.impact}
            </div>
          </div>

          {/* Action Title */}
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            {currentAction.action}
          </h4>

          {/* Action Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Current:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{currentAction.current_state}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Target:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{currentAction.target_state}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Improvement:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{currentAction.estimated_improvement}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Effort:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{currentAction.effort}</span>
              </div>
            </div>
          </div>

          {/* Quick Tip */}
          {currentAction.quick_tip && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">💡</span>
                <span className="text-sm text-green-800 dark:text-green-200">{currentAction.quick_tip}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dots indicator */}
        {normalizedActions.length > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {normalizedActions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-indigo-600'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionStepsCarousel;
