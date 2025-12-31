// PredictionResults component: displays prediction, action plans, description suggestions, content quality
import React from "react";
import { ArrowUp, FileText, Sparkles } from "lucide-react";
import ActionStepsCarousel from "../components/ui/ActionStepsCarousel";
import LengthDescription from "../components/ui/LengthDescription";
import type { PredictionData } from "./Brand";
// import { DUMMY_ACTION_PRIORITIES } from "./mockData";
import { extractTextFromItem } from "./utils";

interface PredictionResultsProps {
  data: PredictionData;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ data }) => {
  return (
    <>
      {/* Prediction Results */}
      <div className="my-8">
        <h2 className="text-xl font-semibold text-[#141414] dark:text-white mb-4">
          Prediction Results
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-xl px-1.5 py-1.5">
            <div className="text-sm font-medium text-gray-400 uppercase tracking-wide p-2">
              Predicted Rank
            </div>
            <div className="rounded-lg p-3 bg-[#fff] dark:bg-[#141414]">
              <div className="text-4xl font-semibold text-[#141414] dark:text-white mb-2">
                {data?.prediction?.predicted_rank != null &&
                typeof data.prediction.predicted_rank === "number"
                  ? data.prediction.predicted_rank.toFixed(2)
                  : "N/A"}
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ArrowUp className="w-4 h-4 text-white bg-emerald-500 p-0.5 rounded-full" />
                <span className="text-sm font-medium">Improvement</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 dark:bg-gray-800 rounded-xl px-1.5 py-1.5">
            <div className="text-sm font-medium text-gray-400 uppercase tracking-wide p-2">
              Current Rank
            </div>
            <div className="rounded-lg p-3 bg-[#fff] dark:bg-[#141414]">
              <div className="text-4xl font-semibold text-[#141414] dark:text-white mb-2">
                {data?.prediction?.current_rank != null &&
                typeof data.prediction.current_rank === "number"
                  ? data.prediction.current_rank.toFixed(2)
                  : "N/A"}
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ArrowUp className="w-4 h-4 text-white bg-emerald-500 p-0.5 rounded-full" />
                <span className="text-sm font-medium">Improvement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Action Plan Label */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Priority Action Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Strategic recommendations to improve your content ranking
        </p>
      </div>

      {/* Length Description - Always at the top */}
      {data?.suggestions?.description?.length &&
        Array.isArray(data.suggestions.description.length) &&
        data.suggestions.description.length.length > 0 && (
          <div className="mb-8">
            <LengthDescription
              lengthSuggestions={data.suggestions.description.length}
            />
          </div>
        )}

      {/* Priority Action Plan */}
      {data?.enhanced?.action_priorities &&
      data.enhanced.action_priorities.length > 0 && (
        <div className="mb-8">
          <ActionStepsCarousel actions={data.enhanced.action_priorities} />
        </div>
      )}
      {/* Mock data fallback commented out - only show if backend returns action_priorities */}
      {/* {!data?.enhanced?.action_priorities || data.enhanced.action_priorities.length === 0 ? (
        <div className="mb-8">
          <ActionStepsCarousel actions={DUMMY_ACTION_PRIORITIES} />
        </div>
      ) : null} */}

      {/* Description Suggestions */}
      <div>
        <h2 className="text-xl font-semibold text-[#141414] dark:text-white mb-4">
          Description Suggestions
        </h2>
        <div className="space-y-4">
          {/* Keywords Section */}
          {data?.suggestions?.description?.keywords &&
            Array.isArray(data.suggestions.description.keywords) &&
            data.suggestions.description.keywords.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Keywords
                  </div>
                </div>

                <div className="space-y-2">
                  {data.suggestions.description.keywords.map(
                    (item: any, idx: number) => {
                      const itemStr = extractTextFromItem(item);
                      return (
                        <div
                          key={idx}
                          className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-gray-400 dark:text-[#ffffff]0">
                            {itemStr.includes("→") ? "→" : "🔑"}
                          </span>
                          <span>{itemStr.replace(/🔑|→/g, "").trim()}</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {/* Content Quality Section */}
          {data?.suggestions?.description?.content &&
            Array.isArray(data.suggestions.description.content) &&
            data.suggestions.description.content.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    Content Quality
                  </div>
                </div>

                <div className="space-y-2">
                  {data.suggestions.description.content.map(
                    (item: any, idx: number) => {
                      const itemStr = extractTextFromItem(item);
                      return (
                        <div
                          key={idx}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span>{itemStr}</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default PredictionResults;
