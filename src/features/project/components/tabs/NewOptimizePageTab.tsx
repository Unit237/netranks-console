import {
  AlertCircle,
  Menu,
  TrendingUp,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { searchBrands } from "../../../brand-rank/services/brandService";
import type { SurveyDetails } from "../../@types";
import type { CreateSearchPayload } from "../../@types/optimization";
import type { RankingAnalysisResponse } from "../../@types/prediction";
import { getBatchPrediction } from "../../services/optimizeService";
import BrandDropdownMenu from "../BrandDropdownMenu";

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
  const [localSelectedPayload, setLocalSelectedPayload] = useState<CreateSearchPayload | null>(null);
  const selectedPayload = selectedPayloadProp !== undefined ? selectedPayloadProp : localSelectedPayload;
  const setSelectedPayload = onSelectedPayloadChange || setLocalSelectedPayload;
  
  const [localBrandUrl, setLocalBrandUrl] = useState<string | null>(null);
  const brandUrl = brandUrlProp !== undefined ? brandUrlProp : localBrandUrl;
  const setBrandUrl = onBrandUrlChange || setLocalBrandUrl;
  
  const [localManualUrl, setLocalManualUrl] = useState<string>("");
  const manualUrl = manualUrlProp !== undefined ? manualUrlProp : localManualUrl;
  const setManualUrl = onManualUrlChange || setLocalManualUrl;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use prop if provided, otherwise use local state
  const [localBatchResponse, setLocalBatchResponse] = useState<RankingAnalysisResponse | null>(null);
  const batchResponse = batchResponseProp !== undefined ? batchResponseProp : localBatchResponse;
  const setBatchResponse = onBatchResponseChange || setLocalBatchResponse;


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

  const triggerPredictions = async (brandName: string, url: string) => {
    // Normalize URL to ensure it has a protocol
    const normalizedUrl = normalizeUrl(url);
    
    if (
      !normalizedUrl ||
      !surveyDetails?.Questions ||
      surveyDetails.Questions.length === 0
    ) {
      console.warn("❌ triggerPredictions early return:", {
        hasNormalizedUrl: !!normalizedUrl,
        hasQuestions: !!surveyDetails?.Questions,
        questionCount: surveyDetails?.Questions?.length || 0,
      });
      return;
    }

    try {
      // Fetch batch predictions for all questions at once
      const response: RankingAnalysisResponse = await getBatchPrediction(
        brandName,
        normalizedUrl,
        surveyDetails.Questions
      );

      // Store the full response
      setBatchResponse(response);
    } catch (error) {
      console.error("❌ Error fetching batch predictions:", error);
      setBatchResponse(null);
    }
  };

  const handleBrandSelect = async (searchPayload: CreateSearchPayload) => {
    setSelectedPayload(searchPayload);
    // Don't clear batchResponse - keep it so brand selection persists
    setManualUrl("");
    setBrandUrl(null);

    // Search for brand URL (but don't trigger predictions yet)
    if (searchPayload.BrandName) {
      try {
        const brands = await searchBrands(searchPayload.BrandName);
        const url = brands[0]?.domain || "";
        setBrandUrl(url);
      } catch (error) {
        console.error("Error searching brands:", error);
        setBrandUrl(null);
      }
    }
  };

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url);
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
            priority.estimated_improvement && `Expected: ${priority.estimated_improvement}`,
          ]
            .filter(Boolean)
            .join(". ");

          allTasks.push({
            id: `task-${taskId++}`,
            title: priority.action.replace(/^(CRITICAL|HIGH|MEDIUM|LOW):\s*/i, ""),
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
      .filter((r) => r.success && r.enhanced?.content_quality?.overall_score !== undefined)
      .map((r) => r.enhanced!.content_quality!.overall_score);
    return scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null;
  }, [batchResponse]);

  const handleSubmit = async () => {
    if (!selectedPayload || !selectedPayload.BrandName) {
      console.warn("❌ No selectedPayload or BrandName");
      return;
    }

    // Determine which URL to use: manual URL takes precedence, then brandUrl from search
    const rawUrl = manualUrl.trim() || brandUrl || "";

    if (!rawUrl || rawUrl.trim() === "") {
      console.warn("❌ No URL provided");
      alert("Please enter a brand URL");
      return;
    }

    // Normalize URL to ensure it has a protocol
    const finalUrl = normalizeUrl(rawUrl);

    setIsSubmitting(true);

    try {
      // Fetch predictions for all questions FIRST, before calling onBrandSelect
      // This prevents the parent from re-rendering and potentially resetting state
      await triggerPredictions(selectedPayload.BrandName, finalUrl);

      // Call parent's onBrandSelect to update dashboard AFTER predictions are fetched
      if (onBrandSelect) {
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
            <BrandDropdownMenu
              surveyId={surveyDetails.Id}
              selectedBrandName={selectedPayload?.BrandName || null}
              onBrandSelect={handleBrandSelect}
            />
          ) : (
            <div className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500">
              Loading survey...
            </div>
          )}
        </div>

        {selectedPayload && (
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
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all"
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
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={
                isSubmitting ||
                (!manualUrl.trim() && (!brandUrl || brandUrl.trim() === ""))
              }
              className="mt-3 w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
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
                <div className="text-sm text-gray-600 mb-4">Content quality</div>
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
                    <span className="text-gray-300">to increase your score</span>
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
                No optimization tasks found. The prediction response did not contain actionable tasks.
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
