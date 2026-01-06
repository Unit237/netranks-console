// Brand prediction component: Main container for brand ranking prediction and suggestions
// Handles API calls, state management, localStorage persistence, and orchestrates subcomponents
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import prms from "../../../app/shared/utils/prms";
import BrandForm from "./BrandForm";
import PredictionResults from "./PredictionResults";
import { questions } from "./constants";

interface RecentSearch {
  name: string;
  url: string;
}

export interface PredictionData {
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
  attribution: {
    segments: Array<{
      segment: string;
      score: number;
    }>;
  };
}

const Brand: React.FC = () => {
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
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Input Form */}
      <BrandForm
        brandName={brandName}
        url={url}
        selectedQuestion={selectedQuestion}
        loading={loading}
        error={error}
        recentSearches={recentSearches}
        onBrandNameChange={setBrandName}
        onUrlChange={setUrl}
        onQuestionChange={setSelectedQuestion}
        onSubmit={handleSubmit}
        onSelectRecentSearch={selectRecentSearch}
      />

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
      {data && !loading && <PredictionResults data={data} />}
    </div>
  );
};

export default Brand;
