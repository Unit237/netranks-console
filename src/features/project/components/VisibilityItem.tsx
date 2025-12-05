import { Search, Smile } from "lucide-react";
import React from "react";
import { AiFillApi } from "react-icons/ai";
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
            <option>
              <svg
                className="w-4 h-4 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              Period
            </option>
          </select>
          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option>
              <AiFillApi />
              Model
            </option>
          </select>
          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option>
              <svg
                className="w-4 h-4 inline-block mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.691h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.046a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.046a1 1 0 00-1.175 0l-2.817 2.046c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.012 8.72a1 1 0 01.588-1.81h3.461a1 1 0 00.951-.691l1.07-3.292z"></path>
              </svg>
              Sentiment
            </option>
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
