import { BarChart3, CheckCircle2, TrendingUp, XCircle } from "lucide-react";
import React, { useState } from "react";
import { searchBrands } from "../../../brand-rank/services/brandService";
import type { SurveyDetails } from "../../@types";
import type { CreateSearchPayload } from "../../@types/optimization";
import type { RankingAnalysisResponse, Result } from "../../@types/prediction";
import { getBatchPrediction } from "../../services/optimizeService";
import BrandDropdownMenu from "../BrandDropdownMenu";

interface OptimizePageTabProps {
  surveyDetails: SurveyDetails;
  onBrandSelect?: (searchPayload: CreateSearchPayload) => void;
}

const NewOptimizePageTab: React.FC<OptimizePageTabProps> = ({
  surveyDetails,
  onBrandSelect,
}) => {
  const [selectedPayload, setSelectedPayload] =
    useState<CreateSearchPayload | null>(null);
  const [brandUrl, setBrandUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState<string>("");
  const [questionPredictions, setQuestionPredictions] = useState<Result[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchResponse, setBatchResponse] =
    useState<RankingAnalysisResponse | null>(null);

  const triggerPredictions = async (brandName: string, url: string) => {
    if (
      !url ||
      !surveyDetails?.Questions ||
      surveyDetails.Questions.length === 0
    ) {
      return;
    }

    try {
      // Fetch batch predictions for all questions at once
      const response: RankingAnalysisResponse = await getBatchPrediction(
        brandName,
        url,
        surveyDetails.Questions
      );

      // Store the full response
      setBatchResponse(response);

      if (response.results && Array.isArray(response.results)) {
        setQuestionPredictions(response.results);
      } else {
        console.warn("Response.results is not an array:", response.results);
        setQuestionPredictions([]);
      }
    } catch (error) {
      console.error("Error fetching batch predictions:", error);
      setBatchResponse(null);
    }
  };

  const handleBrandSelect = async (searchPayload: CreateSearchPayload) => {
    setSelectedPayload(searchPayload);

    setBatchResponse(null);
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

  const handleSubmit = async () => {
    if (!selectedPayload || !selectedPayload.BrandName) {
      return;
    }

    // Determine which URL to use: manual URL takes precedence, then brandUrl from search
    const finalUrl = manualUrl.trim() || brandUrl || "";

    if (!finalUrl || finalUrl.trim() === "") {
      alert("Please enter a brand URL");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call parent's onBrandSelect to update dashboard
      if (onBrandSelect) {
        await onBrandSelect(selectedPayload);
      }

      // Fetch predictions for all questions
      await triggerPredictions(selectedPayload.BrandName, finalUrl);
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("questionPredictions", questionPredictions);

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Left Column - Rank Card */}
      <div className="w-[30vw] flex-shrink-0">
        <div className="mb-4">
          {surveyDetails?.Id ? (
            <BrandDropdownMenu
              surveyId={surveyDetails.Id}
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
              onClick={handleSubmit}
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
      </div>

      {/* Right Column - Results */}
      <div className="flex-1">
        {batchResponse ? (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Prediction Results
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    {new Date(batchResponse.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Items</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {batchResponse.total_items}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-700 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Successful
                  </div>
                  <div className="text-2xl font-semibold text-green-700">
                    {batchResponse.successful_predictions}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="text-sm text-red-700 mb-1 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Failed
                  </div>
                  <div className="text-2xl font-semibold text-red-700">
                    {batchResponse.failed_predictions}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-700 mb-1 flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    Success Rate
                  </div>
                  <div className="text-2xl font-semibold text-blue-700">
                    {batchResponse.total_items > 0
                      ? Math.round(
                          (batchResponse.successful_predictions /
                            batchResponse.total_items) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>

              {/* Response Data Display */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <details className="cursor-pointer">
                  <summary className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                    View Full Response Data from getBatchPrediction
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Response Structure:
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          <span className="font-semibold">success:</span>{" "}
                          {String(batchResponse.success)}
                        </div>
                        <div>
                          <span className="font-semibold">total_items:</span>{" "}
                          {batchResponse.total_items}
                        </div>
                        <div>
                          <span className="font-semibold">
                            successful_predictions:
                          </span>{" "}
                          {batchResponse.successful_predictions}
                        </div>
                        <div>
                          <span className="font-semibold">
                            failed_predictions:
                          </span>{" "}
                          {batchResponse.failed_predictions}
                        </div>
                        <div>
                          <span className="font-semibold">timestamp:</span>{" "}
                          {batchResponse.timestamp}
                        </div>
                        <div>
                          <span className="font-semibold">results:</span>{" "}
                          {batchResponse.results?.length || 0} items
                        </div>
                        <div>
                          <span className="font-semibold">errors:</span>{" "}
                          {batchResponse.errors?.length || 0} items
                        </div>
                      </div>
                    </div>
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 hover:text-gray-800 cursor-pointer">
                        View Raw Response JSON
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96 border border-gray-200">
                        {JSON.stringify(batchResponse, null, 2)}
                      </pre>
                    </details>
                  </div>
                </details>
              </div>
            </div>

            {/* Results Field Summary */}
            <div className="bg-blue-50 rounded-[20px] border-2 border-blue-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Results Field from getBatchPrediction
                  </h3>
                  <p className="text-xs text-blue-700">
                    Total results: {batchResponse.results?.length || 0} items
                    {batchResponse.results &&
                      batchResponse.results.length > 0 && (
                        <span className="ml-2">
                          • Successful:{" "}
                          {
                            batchResponse.results.filter((r) => r.success)
                              .length
                          }{" "}
                          • Failed:{" "}
                          {
                            batchResponse.results.filter((r) => !r.success)
                              .length
                          }
                        </span>
                      )}
                  </p>
                </div>
              </div>
            </div>

            {/* Question Results */}
            <div className="space-y-3">
              {questionPredictions && questionPredictions.length > 0 ? (
                questionPredictions.map((qp) => {
                  const result = qp;
                  const isSuccess = result && result.success;

                  return (
                    <div
                      key={qp.item_index}
                      className={`bg-white rounded-[20px] shadow-sm border-2 ${
                        isSuccess
                          ? "border-green-200"
                          : result
                          ? "border-red-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="p-6">
                        {/* Question Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="mt-1">
                            {isSuccess ? (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                            ) : result ? (
                              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  ?
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            {result && (
                              <div className="text-xs text-gray-500">
                                Item Index: {result.item_index} • Detail Level:{" "}
                                {result.detail_level}
                              </div>
                            )}
                          </div>
                        </div>

                        {result && (
                          <div className="space-y-4">
                            {/* Prediction Data */}
                            {result.prediction && (
                              <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                  Rank Prediction
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-gray-600 mb-1">
                                      Current Rank
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                      {result.prediction.current_rank !== null
                                        ? result.prediction.current_rank.toFixed(
                                            1
                                          )
                                        : "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                      Predicted Rank
                                      <TrendingUp className="w-3 h-3 text-green-600" />
                                    </div>
                                    <div className="text-lg font-semibold text-green-600">
                                      {result.prediction.predicted_rank.toFixed(
                                        1
                                      )}
                                    </div>
                                  </div>
                                  {result.prediction.improvement !== null && (
                                    <div>
                                      <div className="text-xs text-gray-600 mb-1">
                                        Improvement
                                      </div>
                                      <div className="text-lg font-semibold text-gray-900">
                                        {result.prediction.improvement > 0
                                          ? "+"
                                          : ""}
                                        {result.prediction.improvement.toFixed(
                                          1
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-xs text-gray-600 mb-1">
                                      Uncertainty
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                      {result.prediction.uncertainty.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Content Quality */}
                            {result.enhanced?.content_quality && (
                              <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                  Content Quality
                                </h4>
                                <div className="flex items-baseline gap-2 mb-3">
                                  <div className="text-3xl font-semibold text-gray-900">
                                    {
                                      result.enhanced.content_quality
                                        .overall_score
                                    }
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    / 100
                                  </div>
                                  <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    {result.enhanced.content_quality.grade}
                                  </div>
                                </div>
                                {result.enhanced.content_quality
                                  .top_priorities &&
                                  result.enhanced.content_quality.top_priorities
                                    .length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <div className="text-xs font-medium text-gray-700 mb-2">
                                        Top Priorities:
                                      </div>
                                      <div className="space-y-1">
                                        {result.enhanced.content_quality.top_priorities.map(
                                          (priority, idx) => (
                                            <div
                                              key={idx}
                                              className="text-xs text-gray-600"
                                            >
                                              • {priority.action} (
                                              {priority.component})
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}

                            {/* Action Priorities */}
                            {result.enhanced?.action_priorities &&
                              result.enhanced.action_priorities.length > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                    Action Priorities (
                                    {result.enhanced.action_priorities.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {result.enhanced.action_priorities
                                      .slice(0, 5)
                                      .map((action, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-white rounded-lg p-3 border border-gray-200"
                                        >
                                          <div className="flex items-start justify-between mb-1">
                                            <div className="text-sm font-medium text-gray-900">
                                              {action.action}
                                            </div>
                                            <div
                                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                action.impact === "CRITICAL" ||
                                                action.impact === "HIGH"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-gray-100 text-gray-700"
                                              }`}
                                            >
                                              {action.impact}
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {action.current_state} →{" "}
                                            {action.target_state}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {action.estimated_improvement}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                            {/* Suggestions Summary */}
                            {result.suggestions && (
                              <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                  Suggestions Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-gray-600">
                                      Keywords:{" "}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {result.suggestions.description?.keywords
                                        ?.length || 0}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Readability:{" "}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {result.suggestions.description
                                        ?.readability?.length || 0}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Content:{" "}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {result.suggestions.description?.content
                                        ?.length || 0}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Structure:{" "}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {result.suggestions.description?.structure
                                        ?.length || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Raw JSON (Collapsible) */}
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 font-medium">
                                View Raw JSON Data
                              </summary>
                              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96 border border-gray-200">
                                {JSON.stringify(result, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}

                        {!result && (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No result data available for this question
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-yellow-50 rounded-[20px] border-2 border-yellow-200 p-6">
                  <div className="text-center">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      No results found in response
                    </p>
                    <p className="text-xs text-yellow-700">
                      The results field from getBatchPrediction is empty or not
                      available.
                    </p>
                    {batchResponse && (
                      <details className="mt-3 text-left">
                        <summary className="text-xs text-yellow-600 cursor-pointer">
                          View response structure
                        </summary>
                        <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-48 border border-yellow-200">
                          {JSON.stringify(batchResponse, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Errors Section */}
            {batchResponse.errors && batchResponse.errors.length > 0 && (
              <div className="bg-red-50 rounded-[20px] border-2 border-red-200 p-6">
                <h3 className="text-sm font-semibold text-red-900 mb-3">
                  Errors ({batchResponse.errors.length})
                </h3>
                <div className="space-y-2">
                  {batchResponse.errors.map((error, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-3 border border-red-200"
                    >
                      <pre className="text-xs text-red-700 overflow-auto">
                        {JSON.stringify(error, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
