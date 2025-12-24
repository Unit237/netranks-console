import { Eye } from "lucide-react";
import { useState } from "react";
import type { TopBrand } from "../@types";
import { toPercentage } from "../hooks/utils";

interface RankedBrandListProps {
  items: TopBrand[];
}

export default function RankedBrandList({ items }: RankedBrandListProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="flex w-full space-x-8 overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 w-full">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
          Industry Rank
        </h2>

        {/* FIXED HEIGHT + SCROLL */}
        <div className="max-h-[260px] overflow-y-auto">
          {visibleItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2.5 rounded-[20px] border border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-6">
                  {index + 1}.
                </span>

                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
                  <span className="h-6 p-2 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">
                    {toPercentage(item.Percentage)}
                    <Eye className="h-4 w-4 ml-1" />
                  </span>
                  {item.Name}
                </span>
              </div>

              {/* <span className="text-sm text-gray-500 dark:text-gray-400">
                -- mentions
              </span> */}
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
