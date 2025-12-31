// BrandForm component: handles inputs (brandName, url), recent searches, and dropdown selection
import React, { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { MdHttps } from "react-icons/md";
import ProfessionalDropdown from "../components/ui/ProfessionalDropdown";
import { questions } from "./constants";

interface RecentSearch {
  name: string;
  url: string;
}

interface BrandFormProps {
  brandName: string;
  url: string;
  selectedQuestion: string;
  loading: boolean;
  error: string;
  recentSearches: RecentSearch[];
  onBrandNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onQuestionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSelectRecentSearch: (search: RecentSearch) => void;
}

const BrandForm: React.FC<BrandFormProps> = ({
  brandName,
  url,
  selectedQuestion,
  loading,
  error,
  recentSearches,
  onBrandNameChange,
  onUrlChange,
  onQuestionChange,
  onSubmit,
  onSelectRecentSearch,
}) => {
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showUrlSuggestions, setShowUrlSuggestions] = useState(false);

  const filteredSearches = recentSearches.filter(
    (s) =>
      s.name.toLowerCase().includes(brandName.toLowerCase()) ||
      s.url.toLowerCase().includes(url.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#141414] dark:text-white mb-6">
        Rank Prediction & Suggestions
      </h2>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Brand Name Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => onBrandNameChange(e.target.value)}
              onFocus={() => setShowNameSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowNameSuggestions(false), 200)
              }
              placeholder="Open AI"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-[#141414] dark:text-white placeholder-gray-400 dark:placeholder-[#ffffff]0 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all"
            />

            {showNameSuggestions &&
              filteredSearches.length > 0 &&
              brandName && (
                <div className="absolute z-10 w-full mt-1 bg-[#ffffff] dark:bg-[#141414] border-l border-r border-b border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSearches.map((search, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectRecentSearch(search)}
                      className="w-full px-4 py-3 text-left hover:bg-[#ffffff] dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-[#141414] dark:text-white">
                        {search.name}
                      </div>
                      <div className="text-xs text-[#ffffff]0 dark:text-gray-400">
                        {search.url}
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>

          {/* URL Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full URL or Domain
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-500 rounded flex items-center justify-center">
                <MdHttps className="text-white text-xs font-bold" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                onFocus={() => setShowUrlSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowUrlSuggestions(false), 200)
                }
                placeholder="openai.com"
                className="w-full pl-11 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-[#141414] dark:text-white placeholder-gray-400 dark:placeholder-[#ffffff]0 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all"
              />
            </div>

            {showUrlSuggestions && filteredSearches.length > 0 && url && (
              <div className="absolute z-10 w-full mt-1 bg-[#ffffff] dark:bg-[#141414] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSearches.map((search, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectRecentSearch(search)}
                    className="w-full px-4 py-3 text-left hover:bg-[#ffffff] dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-[#141414] dark:text-white">
                      {search.name}
                    </div>
                    <div className="text-xs text-[#ffffff]0 dark:text-gray-400">
                      {search.url}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full mb-4">
          <ProfessionalDropdown
            options={questions}
            value={selectedQuestion}
            onChange={onQuestionChange}
            placeholder="Choose your analysis focus..."
            label="What would you like to analyze?"
            required
            searchable
            showTypingEffect
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !brandName || !url}
          className="w-full md:w-auto px-8 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Get Predictions"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BrandForm;
