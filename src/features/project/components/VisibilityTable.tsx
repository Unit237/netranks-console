import React, { useState } from "react";
import type { VisibilityTableEntry } from "../@types";

interface VisibilityTableProps {
  visibilityEntries: VisibilityTableEntry[];
}

const VisibilityTable: React.FC<VisibilityTableProps> = ({
  visibilityEntries,
}) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
        Visibility table - prompts & brand mentions
      </h2>

      <div className="relative overflow-hidden p-4">
        {/* Table */}
        <table className="w-full border-collapse rounded-[20px] overflow-hidden">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left text-sm text-gray-700 dark:text-gray-300">
              <th className="p-3 w-2/2">Prompt</th>
              <th className="p-3 text-center">Brands Mentioned</th>
              <th className="p-3 text-center">Your Brand Mentioned</th>
              <th className="p-3 text-center">Position</th>
            </tr>
          </thead>

          <tbody>
            {visibilityEntries.map((entry, index) => (
              <VisibilityRow key={index} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisibilityTable;

const VisibilityRow = ({ entry }: { entry: VisibilityTableEntry }) => {
  const [expanded, setExpanded] = useState(false);

  const MAX_BRANDS = 5;
  const brandsToShow = expanded
    ? entry.BrandsMentioned
    : entry.BrandsMentioned.slice(0, MAX_BRANDS);

  const shouldShowToggle = entry.BrandsMentioned.length > MAX_BRANDS;

  return (
    <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
      {/* Prompt */}
      <td className="p-3 align-top">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {entry.Prompt}
        </p>
      </td>

      {/* Brands Mentioned */}
      <td className="p-3 align-top">
        <div className="flex flex-wrap gap-2 justify-start">
          {brandsToShow.map((brand, brandIndex) => (
            <span
              key={brandIndex}
              className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {brand.Name} +{brand.Count}
            </span>
          ))}

          {/* Toggle Button */}
          {shouldShowToggle && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="text-xs text-blue-500 dark:text-blue-400 underline ml-auto"
            >
              {expanded ? "Show Less" : "Show All"}
            </button>
          )}
        </div>
      </td>

      {/* Your Brand Mentioned */}
      <td className="p-3 text-center">
        <span
          className={`font-semibold ${
            entry.YourBrandMentioned
              ? "text-red-500 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {entry.YourBrandMentioned ? "Yes" : "No"}
        </span>
      </td>

      {/* Position */}
      <td className="p-3 text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {entry.Position !== null ? entry.Position : "-"}
        </span>
      </td>
    </tr>
  );
};
