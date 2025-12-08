import {
  AlertCircle,
  ArrowUp,
  BarChart3,
  CheckCircle,
  FileText,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import prms from "../../../app/shared/utils/prms";
import ProfessionalDropdown from "../components/ui/ProfessionalDropdown";
import SegmentCard from "../components/ui/SegmentCard";
import type { Segment } from "../components/ui/SegmentDetailModal";
import SegmentDetailModal from "../components/ui/SegmentDetailModal";

// Types
interface AnalysisResult {
  success: boolean;
  predicted_rank: number;
  summary: {
    total_segments: number;
    avg_uniqueness_score: number;
    avg_preservation_score: number;
    avg_hybrid_score: number;
  };
  top_helping?: Segment[];
  top_hurting?: Segment[];
  segments?: Segment[];
  error?: string;
}

type SortOrder = "original" | "worst-to-best" | "best-to-worst";

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

const analyzeContent = async (data: {
  question_text: string;
  suggest_name: string;
  url_title: string;
  url: string;
}): Promise<AnalysisResult> => {
  const response = await fetch(`${prms.API_BASE_URL}/analyze-segments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question_text: data.question_text,
      suggest_name: data.suggest_name,
      url_title: data.url_title,
      url: data.url,
    }),
  });

  if (!response.ok) throw new Error("Failed to fetch prediction");

  const result = await response.json();

  return {
    success: true,
    ...result,
  };
};

const ContentAttributionAnalyzer: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [formData, setFormData] = useState({
    questionText: "",
    suggestName: "",
    urlTitle: "",
    url: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("original");
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("contentAttribution_formData");
    const savedSelectedQuestion = localStorage.getItem(
      "contentAttribution_selectedQuestion"
    );
    const savedResults = localStorage.getItem("contentAttribution_data");

    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
      } catch (e) {
        console.error("Failed to parse saved form data:", e);
      }
    }

    if (savedSelectedQuestion) {
      setSelectedQuestion(savedSelectedQuestion);
    } else if (savedFormData) {
      // Try to match saved questionText to a question in the dropdown
      try {
        const parsed = JSON.parse(savedFormData);
        if (parsed.questionText) {
          const matchingQuestion = questions.find(
            (q) => q.label === parsed.questionText
          );
          if (matchingQuestion) {
            setSelectedQuestion(matchingQuestion.value);
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        if (parsed.success) {
          setResults(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved results:", e);
      }
    }
  }, []);

  const handleSubmit = async () => {
    // Get the question text from the selected question
    const selectedQuestionObj = questions.find(
      (q) => q.value === selectedQuestion
    );
    const questionText = selectedQuestionObj?.label || formData.questionText;

    if (!questionText || !formData.url) {
      setError("Please fill in required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await analyzeContent({
        question_text: questionText,
        suggest_name: formData.suggestName,
        url_title: formData.urlTitle,
        url: formData.url,
      });

      if (result.success) {
        setResults(result);
        // Save to localStorage
        localStorage.setItem("contentAttribution_data", JSON.stringify(result));
        localStorage.setItem(
          "contentAttribution_formData",
          JSON.stringify({
            ...formData,
            questionText: questionText,
          })
        );
        if (selectedQuestion) {
          localStorage.setItem(
            "contentAttribution_selectedQuestion",
            selectedQuestion
          );
        }
      } else {
        setError(result.error || "Analysis failed");
      }
    } catch (error) {
      setError("Error: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const validProtocol = ["http:", "https:"].includes(parsed.protocol);

      const tldPattern = /\.[a-z]{2,}(?:\.[a-z]{2,})?$/i;

      return validProtocol && tldPattern.test(parsed.hostname);
    } catch {
      return false;
    }
  };

  const handleChange = (key: string, value: string) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);

    const allFilled = Object.values(updated).every((v) => v && v.trim() !== "");

    if (allFilled && isValidUrl(updated.url)) {
      handleSubmit();
    }
  };

  const sortedSegments = useMemo(() => {
    if (!results?.segments) return [];

    const segments = [...results.segments];

    switch (sortOrder) {
      case "worst-to-best":
        return segments.sort((a, b) => a.hybrid_score - b.hybrid_score);
      case "best-to-worst":
        return segments.sort((a, b) => b.hybrid_score - a.hybrid_score);
      default:
        return segments.sort((a, b) => a.start - b.start);
    }
  }, [results?.segments, sortOrder]);

  const getScoreColor = (score: number) => {
    if (score > 0) {
      const intensity = Math.min(score, 1.0);
      return `rgba(16, 185, 129, ${0.2 + intensity * 0.6})`;
    } else if (score < 0) {
      const intensity = Math.min(Math.abs(score), 1.0);
      return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`;
    }
    return "rgba(156, 163, 175, 0.2)";
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}

        <div className="">
          <h2 className="text-xl font-semibold text-[#141414] dark:text-white">
            Rank Prediction & Suggestions
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Understand which parts of your content help or hurt your AI
            visibility ranking
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800">
          <div className="space-y-4">
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="suggestName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Suggest Name / Brand{" "}
                  <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  id="suggestName"
                  value={formData.suggestName}
                  onChange={(e) => handleChange("suggestName", e.target.value)}
                  placeholder="OpenAI"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="urlTitle"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  URL / Domain{" "}
                  <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  id="urlTitle"
                  value={formData.urlTitle}
                  onChange={(e) => handleChange("urlTitle", e.target.value)}
                  placeholder="openai.com"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Full URL{" "}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 ml-2">
                  🔗 Auto-Fetch
                </span>
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => handleChange("url", e.target.value)}
                placeholder="https://openai.com/product"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Site content will be automatically fetched and analyzed from
                this URL
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                "Analyze Content Attribution"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6 mt-5">
            {/* Summary Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Predicted Rank
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      {results.predicted_rank.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-indigo-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Total Segments
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      {results.summary.total_segments}
                    </p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-indigo-500" />
                </div>
              </div>
            </div>

            {/* Top Segments */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Helping Segments */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Top Segments Helping Visibility
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  These segments contribute positively to your AI visibility
                  ranking
                </p>
                <div className="space-y-3">
                  {results.top_helping &&
                    results.top_helping.length > 0 &&
                    results.top_helping.map((segment, idx) => (
                      <SegmentCard
                        key={idx}
                        segment={segment}
                        rank={idx + 1}
                        type="helping"
                        onClick={setSelectedSegment}
                      />
                    ))}
                </div>
              </div>

              {/* Hurting Segments */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Top Segments Hurting Visibility
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  These segments negatively impact your ranking
                </p>
                <div className="space-y-3">
                  {results.top_hurting &&
                    results.top_hurting.length > 0 &&
                    results.top_hurting.map((segment, idx) => (
                      <SegmentCard
                        key={idx}
                        segment={segment}
                        rank={idx + 1}
                        type="hurting"
                        onClick={setSelectedSegment}
                      />
                    ))}
                </div>
              </div>
            </div>

            {/* Content Heatmap */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    Content Heatmap
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Visual representation of how each segment impacts visibility
                  </p>
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="original">Original Order</option>
                  <option value="worst-to-best">Worst to Best</option>
                  <option value="best-to-worst">Best to Worst</option>
                </select>
              </div>

              <div className="space-y-2">
                {sortedSegments.map((segment, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSegment(segment)}
                    style={{
                      backgroundColor: getScoreColor(segment.hybrid_score),
                    }}
                    className="p-3 rounded-lg cursor-pointer transition-transform hover:scale-[1.02] border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                        {segment.text.length > 100
                          ? segment.text.substring(0, 100) + "..."
                          : segment.text}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {segment.hybrid_score.toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Score Breakdown
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Avg Uniqueness Score
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {results.summary.avg_uniqueness_score.toFixed(3)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Avg Preservation Score
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {results.summary.avg_preservation_score.toFixed(3)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Avg Hybrid Score
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {results.summary.avg_hybrid_score.toFixed(3)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Segment Detail Modal */}
        {selectedSegment && (
          <SegmentDetailModal
            segment={selectedSegment}
            onClose={() => setSelectedSegment(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ContentAttributionAnalyzer;
