import { AlertCircle, ChevronDown, Menu, TrendingUp } from "lucide-react";
import LoadingButton from "../../../../app/components/LoadingButton";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { searchBrands } from "../../../brand-rank/services/brandService";
import type { SurveyDetails } from "../../@types";
import type { Brand, CreateSearchPayload } from "../../@types/optimization";
import type { RankingAnalysisResponse } from "../../@types/prediction";
import {
  getBatchPrediction,
  getDashboardFilterFields,
} from "../../services/optimizeService";

interface Task {
  id: string;
  title: string;
  description: string;
  impact: "high" | "normal";
  completed?: boolean;
}

interface OptimizePageTabProps {
  surveyDetails: SurveyDetails;
  batchResponse?: RankingAnalysisResponse | null;
  onBatchResponseChange?: (response: RankingAnalysisResponse | null) => void;
  selectedPayload?: CreateSearchPayload | null;
  onSelectedPayloadChange?: (payload: CreateSearchPayload | null) => void;
  brandUrl?: string | null;
  onBrandUrlChange?: (url: string | null) => void;
  manualUrl?: string;
  onManualUrlChange?: (url: string) => void;
  onBrandSelect?: (searchPayload: CreateSearchPayload) => void;
}

const NewOptimizePageTab: React.FC<OptimizePageTabProps> = ({
  surveyDetails,
  batchResponse: batchResponseProp,
  onBatchResponseChange,
  selectedPayload: selectedPayloadProp,
  onSelectedPayloadChange,
  brandUrl: brandUrlProp,
  onBrandUrlChange,
  manualUrl: manualUrlProp,
  onManualUrlChange,
  onBrandSelect,
}) => {
  // Use prop if provided, otherwise use local state
  const [localSelectedPayload, setLocalSelectedPayload] =
    useState<CreateSearchPayload | null>(null);
  const selectedPayload =
    selectedPayloadProp !== undefined
      ? selectedPayloadProp
      : localSelectedPayload;
  const setSelectedPayload = onSelectedPayloadChange || setLocalSelectedPayload;

  const [localBrandUrl, setLocalBrandUrl] = useState<string | null>(null);
  const brandUrl = brandUrlProp !== undefined ? brandUrlProp : localBrandUrl;
  const setBrandUrl = onBrandUrlChange || setLocalBrandUrl;

  const [localManualUrl, setLocalManualUrl] = useState<string>("");
  const manualUrl =
    manualUrlProp !== undefined ? manualUrlProp : localManualUrl;
  const setManualUrl = onManualUrlChange || setLocalManualUrl;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Use prop if provided, otherwise use local state
  const [localBatchResponse, setLocalBatchResponse] =
    useState<RankingAnalysisResponse | null>(null);
  const batchResponse =
    batchResponseProp !== undefined ? batchResponseProp : localBatchResponse;
  const setBatchResponse = onBatchResponseChange || setLocalBatchResponse;

  // Brand combobox state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandInput, setBrandInput] = useState<string>("");
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Question dropdown state
  const [selectedQuestion, setSelectedQuestion] = useState<{
    Id: number;
    Text: string;
  } | null>(null);
  const [isQuestionDropdownOpen, setIsQuestionDropdownOpen] = useState(false);
  const questionDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch brands for dropdown
  useEffect(() => {
    const fetchBrands = async () => {
      if (!surveyDetails?.Id) return;
      try {
        const res = await getDashboardFilterFields(surveyDetails.Id);
        setBrands(res.Brands);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, [surveyDetails?.Id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBrandDropdownOpen(false);
      }
      if (
        questionDropdownRef.current &&
        !questionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsQuestionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update brand input when selectedPayload changes
  useEffect(() => {
    if (selectedPayload?.BrandName) {
      setBrandInput(selectedPayload.BrandName);
    }
  }, [selectedPayload?.BrandName]);

  // Helper function to normalize URL - ensure it has a protocol
  const normalizeUrl = (url: string): string => {
    if (!url || typeof url !== "string") return url;
    const trimmed = url.trim();
    if (!trimmed) return trimmed;

    // If URL already has protocol, return as-is
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    // Otherwise, add https://
    return `https://${trimmed}`;
  };

  // Helper function to detect if error is a fetch/CORS error
  const isFetchOrCorsError = (error: unknown): boolean => {
    if (!error) return false;
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    
    // Check for common fetch/CORS error indicators
    const fetchErrorIndicators = [
      "Failed to fetch",
      "NetworkError",
      "Network request failed",
      "CORS",
      "cors",
      "blocked by CORS",
      "Access-Control",
      "fetch",
      "network",
      "ERR_FAILED",
      "ERR_NETWORK",
      "ERR_CONNECTION",
    ];
    
    return (
      errorName === "TypeError" ||
      errorName === "NetworkError" ||
      fetchErrorIndicators.some((indicator) =>
        errorMessage.toLowerCase().includes(indicator.toLowerCase())
      )
    );
  };

  const triggerPredictions = async (brandName: string, url: string) => {
    // Normalize URL to ensure it has a protocol
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      console.warn("❌ triggerPredictions early return: No URL");
      setFetchError(null); // Clear error if no URL
      return;
    }

    // Use selected question if available, otherwise use all questions
    const questionsToUse = selectedQuestion
      ? [selectedQuestion]
      : surveyDetails?.Questions || [];

    if (questionsToUse.length === 0) {
      console.warn("❌ triggerPredictions early return: No questions", {
        hasSelectedQuestion: !!selectedQuestion,
        questionCount: surveyDetails?.Questions?.length || 0,
      });
      setFetchError(null); // Clear error if no questions
      return;
    }

    // Clear previous error
    setFetchError(null);

    try {
      // Fetch batch predictions for selected question(s)
      const response: RankingAnalysisResponse = await getBatchPrediction(
        brandName,
        normalizedUrl,
        questionsToUse
      );

      // Store the full response
      setBatchResponse(response);
      setFetchError(null); // Clear error on success
    } catch (error) {
      console.error("❌ Error fetching batch predictions:", error);
      setBatchResponse(null);
      
      // Check if it's a fetch/CORS error
      if (isFetchOrCorsError(error)) {
        setFetchError("this site doesn't allow us to fetch content");
      } else {
        // For other errors, don't show the CORS message
        setFetchError(null);
      }
    }
  };

  const handleBrandInputChange = (value: string) => {
    setBrandInput(value);
    setIsBrandDropdownOpen(true);
  };

  const handleBrandSelect = async (brandName: string, brandId?: number) => {
    setBrandInput(brandName);
    setIsBrandDropdownOpen(false);

    const searchPayload: CreateSearchPayload = {
      StartDate: undefined,
      EndDate: undefined,
      QuestionIds: [],
      BrandId: brandId,
      BrandName: brandName,
      ModelIds: [],
    };

    setSelectedPayload(searchPayload);
    // Don't clear batchResponse - keep it so brand selection persists
    setManualUrl("");
    setBrandUrl(null);

    // Search for brand URL (but don't trigger predictions yet)
    if (brandName) {
      try {
        const brands = await searchBrands(brandName);
        const url = brands[0]?.domain || "";
        setBrandUrl(url);
      } catch (error) {
        console.error("Error searching brands:", error);
        setBrandUrl(null);
      }
    }
  };

  const handleQuestionSelect = (question: { Id: number; Text: string }) => {
    setSelectedQuestion(question);
    setIsQuestionDropdownOpen(false);
  };

  const filteredBrands = useMemo(() => {
    if (!brandInput.trim()) return brands;
    const inputLower = brandInput.toLowerCase();
    return brands.filter((brand) =>
      brand.Name.toLowerCase().includes(inputLower)
    );
  }, [brandInput, brands]);

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url);
    // Clear error when user changes the URL
    if (fetchError) {
      setFetchError(null);
    }
  };

  // Transform action_priorities from batch response into tasks
  const tasks = useMemo(() => {
    if (!batchResponse?.results) {
      return [];
    }

    const allTasks: Task[] = [];
    let taskId = 1;

    batchResponse.results.forEach((result) => {
      if (result.success && result.enhanced?.action_priorities) {
        result.enhanced.action_priorities.forEach((priority) => {
          // Determine impact
          const impact: "high" | "normal" =
            priority.impact === "CRITICAL" || priority.impact === "HIGH"
              ? "high"
              : "normal";

          // Build description from current_state, target_state, and estimated_improvement
          const description = [
            priority.current_state,
            priority.target_state && `Target: ${priority.target_state}`,
            priority.estimated_improvement &&
              `Expected: ${priority.estimated_improvement}`,
          ]
            .filter(Boolean)
            .join(". ");

          allTasks.push({
            id: `task-${taskId++}`,
            title: priority.action.replace(
              /^(CRITICAL|HIGH|MEDIUM|LOW):\s*/i,
              ""
            ),
            description: description || priority.quick_tip || priority.action,
            impact,
            completed: false,
          });
        });
      }
    });

    // Sort tasks by impact: high impact first, then normal impact
    const sortedTasks = allTasks.sort((a, b) => {
      if (a.impact === "high" && b.impact === "normal") return -1;
      if (a.impact === "normal" && b.impact === "high") return 1;
      return 0; // Keep original order for same impact level
    });

    return sortedTasks;
  }, [batchResponse]);

  // Calculate average rank and content quality from results
  const averageRank = useMemo(() => {
    if (!batchResponse?.results) return null;
    // Use only predicted_rank
    const ranks = batchResponse.results
      .filter((r) => r.success && r.prediction?.predicted_rank !== null)
      .map((r) => r.prediction!.predicted_rank);
    return ranks.length > 0
      ? ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length
      : null;
  }, [batchResponse]);

  const averageContentQuality = useMemo(() => {
    if (!batchResponse?.results) return null;
    const scores = batchResponse.results
      .filter(
        (r) =>
          r.success && r.enhanced?.content_quality?.overall_score !== undefined
      )
      .map((r) => r.enhanced!.content_quality!.overall_score);
    return scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        )
      : null;
  }, [batchResponse]);

  const handleSubmit = async () => {
    // Use brandInput if no selectedPayload exists
    const brandName = selectedPayload?.BrandName || brandInput.trim();

    if (!brandName || brandName.trim() === "") {
      console.warn("❌ No brand name provided");
      alert("Please enter or select a brand");
      return;
    }

    // Determine which URL to use: manual URL takes precedence, then brandUrl from search
    const rawUrl = manualUrl.trim() || brandUrl || "";

    if (!rawUrl || rawUrl.trim() === "") {
      console.warn("❌ No URL provided");
      alert("Please enter a brand URL");
      return;
    }

    // If no selectedPayload exists, create one from brandInput
    if (!selectedPayload && brandInput.trim()) {
      const newPayload: CreateSearchPayload = {
        StartDate: undefined,
        EndDate: undefined,
        QuestionIds: [],
        BrandId: undefined,
        BrandName: brandInput.trim(),
        ModelIds: [],
      };
      setSelectedPayload(newPayload);
    }

    // Normalize URL to ensure it has a protocol
    const finalUrl = normalizeUrl(rawUrl);

    setIsSubmitting(true);

    try {
      // Fetch predictions for selected question(s) FIRST, before calling onBrandSelect
      // This prevents the parent from re-rendering and potentially resetting state
      await triggerPredictions(brandName, finalUrl);

      // Call parent's onBrandSelect to update dashboard AFTER predictions are fetched
      if (onBrandSelect && selectedPayload) {
        await onBrandSelect(selectedPayload);
      }
    } catch (error) {
      console.error("❌ Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Left Column - Rank Card */}
      <div className="w-[30vw] flex-shrink-0">
        <div className="mb-4">
          {surveyDetails?.Id ? (
            <div className="relative" ref={brandDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={brandInput}
                  onChange={(e) => handleBrandInputChange(e.target.value)}
                  onFocus={() => setIsBrandDropdownOpen(true)}
                  placeholder="Select or type a brand name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all pr-10"
                />
                <ChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-transform pointer-events-none ${
                    isBrandDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isBrandDropdownOpen && filteredBrands.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredBrands.map((brand) => {
                    const isSelected =
                      selectedPayload?.BrandName === brand.Name;
                    return (
                      <button
                        key={brand.Id}
                        type="button"
                        onClick={() => handleBrandSelect(brand.Name, brand.Id)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                          isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <div
                          className={`text-sm font-medium ${
                            isSelected
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {brand.Name}
                          {isSelected && (
                            <span className="ml-2 text-xs">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {isBrandDropdownOpen &&
                brandInput.trim() &&
                filteredBrands.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <button
                      type="button"
                      onClick={() => handleBrandSelect(brandInput.trim())}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-900 dark:text-white"
                    >
                      Use "{brandInput.trim()}" as custom brand
                    </button>
                  </div>
                )}
            </div>
          ) : (
            <div className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500">
              Loading survey...
            </div>
          )}
        </div>

        {/* Question Dropdown */}
        {surveyDetails?.Questions && surveyDetails.Questions.length > 0 && (
          <div className="mb-4">
            <div className="relative" ref={questionDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setIsQuestionDropdownOpen(!isQuestionDropdownOpen)
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedQuestion
                    ? selectedQuestion.Text
                    : "Select a question (or leave empty for all)"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isQuestionDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isQuestionDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuestion(null);
                      setIsQuestionDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 ${
                      !selectedQuestion ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        !selectedQuestion
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      All questions
                      {!selectedQuestion && (
                        <span className="ml-2 text-xs">✓</span>
                      )}
                    </div>
                  </button>
                  {surveyDetails.Questions.map((question) => {
                    const isSelected = selectedQuestion?.Id === question.Id;
                    return (
                      <button
                        key={question.Id}
                        type="button"
                        onClick={() => handleQuestionSelect(question)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                          isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <div
                          className={`text-sm font-medium ${
                            isSelected
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {question.Text}
                          {isSelected && (
                            <span className="ml-2 text-xs">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {(selectedPayload || brandInput.trim()) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Brand URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => handleManualUrlChange(e.target.value)}
              placeholder={
                brandUrl && brandUrl.trim() !== ""
                  ? `Using: ${brandUrl} (or enter custom URL)`
                  : "Enter brand URL (required)"
              }
              required
              className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                fetchError
                  ? "border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500"
                  : "border-gray-200 dark:border-gray-600 focus:ring-green-500 dark:focus:ring-green-400"
              }`}
            />
            {brandUrl && brandUrl.trim() !== "" && !manualUrl && (
              <p className="mt-1 text-xs text-gray-500">
                URL found from search: {brandUrl}. You can override it above or
                click Submit to use it.
              </p>
            )}
            {manualUrl && (
              <p className="mt-1 text-xs text-green-600">
                {brandUrl && brandUrl.trim() !== ""
                  ? `Will override search URL with: ${manualUrl}`
                  : `Using manual URL: ${manualUrl}`}
              </p>
            )}
            {!brandUrl && !manualUrl && (
              <p className="mt-1 text-xs text-orange-600">
                No URL found from search. Please enter a URL.
              </p>
            )}
            {fetchError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                {fetchError}
              </p>
            )}
            <LoadingButton
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
              loading={isSubmitting}
              loadingText="Submitting..."
              disabled={
                isSubmitting ||
                !brandInput.trim() ||
                (!manualUrl.trim() && (!brandUrl || brandUrl.trim() === ""))
              }
              className="mt-3 w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Submit
            </LoadingButton>
          </div>
        )}

        {/* Rank and Content Quality Cards */}
        {batchResponse && averageRank !== null && (
          <div className="bg-gray-100 rounded-[20px] shadow-sm border border-gray-200 space-y-4">
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-4">Current rank</div>
              <div className="pt-24 flex items-end justify-between gap-2">
                <div className="text-[19px] font-normal">
                  {averageRank.toFixed(1)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    {averageRank < 10 ? "Improving" : "Needs work"}
                  </span>
                  <span className="text-gray-400">expected rank</span>
                </div>
              </div>
            </div>

            {averageContentQuality !== null && (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
                <div className="text-sm text-gray-600 mb-4">
                  Content quality
                </div>
                <div className="pt-24 flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2 mb-2">
                    <Menu className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-600 text-[19px] font-normal">
                      {averageContentQuality}
                    </span>
                    <span className="text-gray-300 text-[19px] font-light">
                      / 100
                    </span>
                  </div>
                  <div className="text-sm text-gray-800">
                    {tasks.length} tasks{" "}
                    <span className="text-gray-300">
                      to increase your score
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column - Tasks */}
      <div className="flex-1">
        {batchResponse && tasks.length > 0 ? (
          <div className="bg-gray-100 rounded-[20px] shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Your tasks
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  {tasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-2 p-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors bg-white rounded-[20px] shadow-sm border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {task.description}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          {task.impact === "high" ? (
                            <>
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              <span className="text-xs font-medium text-red-600">
                                High impact
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                              <span className="text-xs text-gray-500">
                                Normal impact
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : batchResponse ? (
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                No optimization tasks found. The prediction response did not
                contain actionable tasks.
              </p>
            </div>
          </div>
        ) : selectedPayload ? (
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                No predictions available. Please submit to fetch predictions.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Select a brand to see optimization recommendations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOptimizePageTab;
