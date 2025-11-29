import {
  AlertCircle,
  ArrowUp,
  FileText,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { MdHttps } from "react-icons/md";
import prms from "../../../app/shared/utils/prms";
import ActionStepsCarousel from "../components/ui/ActionStepsCarousel";
import LengthDescription from "../components/ui/LengthDescription";
import ProfessionalDropdown from "../components/ui/ProfessionalDropdown";

interface RecentSearch {
  name: string;
  url: string;
}

interface PredictionData {
  prediction: {
    current_rank: number;
    predicted_rank: number;
    improvement: number;
    uncertainty: number;
  };
  enhanced: {
    action_priorities: Array<{
      priority?: string;
      title?: string;
      details?: {
        current: string;
        target: string;
        improvement: string;
        effort: string;
      };
      action: string;
      current_state?: string;
      target_state?: string;
      estimated_improvement?: string;
      effort?: string;
      impact?: string;
      quick_tip?: string;
    }>;
    content_quality: {
      overall_score: number;
      grade: string;
      components: Record<string, number>;
      strengths: Array<{ component: string; score: number }>;
      weaknesses: Array<{
        component: string;
        score: number;
        improvement_needed: string;
      }>;
    };
  };
  suggestions: {
    description: {
      length: string[];
      keywords: string[];
      structure: string[];
      content: string[];
      examples: string[];
    };
  };
}

const DUMMY_ACTION_PRIORITIES = [
  {
    action: "Optimize Description Length",
    current_state: "12131 characters",
    target_state: "4142 characters (3728-4556 range)",
    estimated_improvement: "1.0-2.5 rank positions",
    effort: "Low",
    impact: "High",
    quick_tip: "Remove ~ 7989 characters",
  },
];

// Force TypeScript refresh
const questions = [
  {
    value: "ranking_optimization",
    label:
      "Which project management apps are industry leaders currently using?",
    description:
      "Discover top project management tools used by industry leaders",
    category: "Project Management",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: "content_gaps",
    label:
      "Looking for cloud-based software to oversee construction projects—any suggestions?",
    description:
      "Find specialized construction project management software solutions",
    category: "Construction Software",
    icon: <Target className="w-4 h-4" />,
  },
  {
    value: "competitor_analysis",
    label:
      "How can I access healthcare advice 24/7 without going to the hospital?",
    description: "Explore 24/7 healthcare advice and telemedicine services",
    category: "Healthcare Services",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    value: "keyword_optimization",
    label: "What app offers online doctor booking and chat in Indonesia?",
    description: "Find telemedicine apps with doctor booking in Indonesia",
    category: "Telemedicine Apps",
    icon: <ArrowUp className="w-4 h-4" />,
  },
  {
    value: "content_structure",
    label: "Where can I find telemedicine services for common illnesses?",
    description: "Locate telemedicine platforms for common health issues",
    category: "Telemedicine Services",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    value: "user_intent",
    label: "I need top-notch printing services in Warsaw. Any recommendations?",
    description: "Find high-quality printing services in Warsaw, Poland",
    category: "Printing Services",
    icon: <Target className="w-4 h-4" />,
  },
  {
    value: "technical_seo",
    label: "Which software works best for collaborative project planning?",
    description: "Compare collaborative project planning software solutions",
    category: "Collaborative Tools",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  {
    value: "content_freshness",
    label: "What app offers online doctor booking and chat in Indonesia?",
    description: "Find telemedicine apps with doctor booking in Indonesia",
    category: "Telemedicine Apps",
    icon: <Sparkles className="w-4 h-4" />,
  },
];

// Helper function to extract text from an item (string or object)
const extractTextFromItem = (item: any): string => {
  if (typeof item === "string") {
    return item;
  }
  if (typeof item === "object" && item !== null) {
    // Try common property names first
    if (item.text) return item.text;
    if (item.message) return item.message;
    if (item.suggestion) return item.suggestion;
    if (item.value) return item.value;
    if (item.content) return item.content;
    if (item.description) return item.description;
    if (item.title) return item.title;

    // Try to find any string property
    for (const key in item) {
      if (typeof item[key] === "string" && item[key]) {
        return item[key];
      }
    }

    // Last resort: format as readable string
    return JSON.stringify(item, null, 2);
  }
  return String(item || "");
};

const Brand = () => {
  // Initialize state from localStorage immediately to prevent overwriting
  const getInitialBrandName = () => {
    const saved = localStorage.getItem("brandForm_brandName");
    return saved !== null ? saved : "";
  };
  const getInitialUrl = () => {
    const saved = localStorage.getItem("brandForm_url");
    return saved !== null ? saved : "";
  };
  const getInitialSelectedQuestion = () => {
    const saved = localStorage.getItem("brandForm_selectedQuestion");
    return saved !== null ? saved : "";
  };
  const getInitialData = (): PredictionData | null => {
    const saved = localStorage.getItem("brandForm_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
        return null;
      }
    }
    return null;
  };

  const [, setTheme] = useState<"light" | "dark">("light");
  const [brandName, setBrandName] = useState(getInitialBrandName);
  const [url, setUrl] = useState(getInitialUrl);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PredictionData | null>(getInitialData);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showUrlSuggestions, setShowUrlSuggestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | "">(
    getInitialSelectedQuestion
  );
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Save form data to localStorage whenever it changes (but skip initial mount)
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    localStorage.setItem("brandForm_brandName", brandName);
  }, [brandName, isInitialMount]);

  useEffect(() => {
    if (isInitialMount) return;
    localStorage.setItem("brandForm_url", url);
  }, [url, isInitialMount]);

  useEffect(() => {
    if (isInitialMount) return;
    localStorage.setItem("brandForm_selectedQuestion", selectedQuestion);
  }, [selectedQuestion, isInitialMount]);

  useEffect(() => {
    if (isInitialMount) return;
    if (data) {
      localStorage.setItem("brandForm_data", JSON.stringify(data));
    } else {
      // Clear saved data if it's explicitly set to null
      localStorage.removeItem("brandForm_data");
    }
  }, [data, isInitialMount]);

  // Error boundary for rendering
  if (renderError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Rendering Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{renderError}</p>
          <button
            onClick={() => setRenderError(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }

    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const saveRecentSearch = (name: string, url: string) => {
    const newSearch = { name, url };
    const updated = [
      newSearch,
      ...recentSearches.filter((s) => s.name !== name || s.url !== url),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    try {
      // Get the question text from the selected question
      const selectedQuestionObj = questions.find(
        (q) => q.value === selectedQuestion
      );
      const questionText = selectedQuestionObj?.label || brandName;

      // Make both API calls in parallel
      const predictionPromise = fetch(`${prms.API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: questionText,
          suggest_name: brandName,
          description: brandName,
          url_title: brandName,
          url: url,
          survey_description: "",
          description_short: "",
          explain: false,
          detail_level: "standard",
        }),
      });

      // Content Attribution API call (only if we have required fields)
      const attributionPromise =
        url && questionText
          ? fetch(`${prms.API_BASE_URL}/analyze-segments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question_text: questionText,
                suggest_name: brandName,
                url_title: brandName,
                url: url,
              }),
            })
          : Promise.resolve(null);

      const [predictionResponse, attributionResponse] =
        await Promise.allSettled([predictionPromise, attributionPromise]);

      // Handle prediction response
      if (predictionResponse.status === "fulfilled") {
        const response = predictionResponse.value;
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to fetch prediction";
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("API response:", result);

        // Validate response structure
        if (!result || typeof result !== "object") {
          throw new Error("Invalid response format from server");
        }

        // Ensure prediction object exists with safe defaults
        if (!result.prediction) {
          result.prediction = {
            predicted_rank: null,
            current_rank: null,
            improvement: null,
            uncertainty: null,
          };
        }

        setData(result);
        saveRecentSearch(brandName, url);
      } else if (predictionResponse.status === "rejected") {
        throw predictionResponse.reason;
      }

      // Handle content attribution response (save to localStorage even if prediction fails)
      if (
        attributionResponse.status === "fulfilled" &&
        attributionResponse.value
      ) {
        const response = attributionResponse.value;
        if (response && response.ok) {
          try {
            const attributionResult = await response.json();
            if (attributionResult.success) {
              // Save to localStorage for Content Attribution tab
              localStorage.setItem(
                "contentAttribution_data",
                JSON.stringify(attributionResult)
              );
              localStorage.setItem(
                "contentAttribution_formData",
                JSON.stringify({
                  questionText,
                  suggestName: brandName,
                  urlTitle: brandName,
                  url: url,
                })
              );
              console.log("Content Attribution data saved");
            }
          } catch (err) {
            console.error("Failed to save content attribution:", err);
            // Don't throw - attribution is optional
          }
        }
      }
    } catch (err: any) {
      console.error("Prediction error:", err);
      setError(err?.message || "Failed to get prediction. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const selectRecentSearch = (search: RecentSearch) => {
    setBrandName(search.name);
    setUrl(search.url);
    setShowNameSuggestions(false);
    setShowUrlSuggestions(false);
  };

  const filteredSearches = recentSearches.filter(
    (s) =>
      s.name.toLowerCase().includes(brandName.toLowerCase()) ||
      s.url.toLowerCase().includes(url.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Input Form */}
      <div className="">
        <h2 className="text-xl font-semibold text-[#141414] dark:text-white mb-6">
          Rank Prediction & Suggestions
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Brand Name Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
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
                        onClick={() => selectRecentSearch(search)}
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
                  onChange={(e) => setUrl(e.target.value)}
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
                      onClick={() => selectRecentSearch(search)}
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
              onChange={setSelectedQuestion}
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

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your content...
          </p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
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
          data.enhanced.action_priorities.length > 0 ? (
            <div className="mb-8">
              <ActionStepsCarousel actions={data.enhanced.action_priorities} />
            </div>
          ) : (
            <div className="mb-8">
              <ActionStepsCarousel actions={DUMMY_ACTION_PRIORITIES} />
            </div>
          )}

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
      )}
    </div>
  );
};

export default Brand;
