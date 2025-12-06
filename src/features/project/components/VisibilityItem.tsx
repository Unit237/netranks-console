import { Search, Smile } from "lucide-react";
import React from "react";
import type { VisibilityTableEntry } from "../@types";
import BrandInitialsList from "./BrandInitialList";

interface VisibilityItemProps {
  mention: VisibilityTableEntry[];
}

const VisibilityItem: React.FC<VisibilityItemProps> = ({ mention }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
            B
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Baked Design mentions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option>Period</option>
          </select>
          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option>Model</option>
          </select>
          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option>Sentiment</option>
          </select>
        </div>
      </div>

      <div className="">
        {mention.map((mention, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-[20px] border border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              {mention.Position === "success" ? (
                <Smile className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Smile className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                    {mention.Prompt}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    h ago
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-100 mb-1"></p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <BrandInitialsList items={mention.BrandsMentioned} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisibilityItem;
