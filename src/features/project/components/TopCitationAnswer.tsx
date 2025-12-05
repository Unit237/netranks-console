import { useState } from "react";
import type { TopCitation } from "../@types";
import { toPercentage } from "../hooks/utils";

interface TopCitationAnswerProps {
  items: TopCitation[];
}

export default function TopCitationAnswer({ items }: TopCitationAnswerProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="flex w-full space-x-8 overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 w-full">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
          Top citations in AI answers
        </h2>

        {/* FIXED HEIGHT + SCROLL */}
        <div className="max-h-[260px] overflow-y-auto">
          {visibleItems.map((citation, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 rounded-[20px] border border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-6">
                  {index + 1}.
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {citation.RegistrableDomain}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {toPercentage(citation.Percentage)}
              </span>
            </div>
          ))}
        </div>

        {/* SHOW ALL / SHOW LESS BUTTON */}
        {items.length > 5 && (
          <div className="flex justify-end px-4 py-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-primary dark:text-primary-hover hover:underline"
            >
              {showAll ? "Show less" : "Show all"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
