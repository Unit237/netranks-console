import {
  AlertCircle,
  Edit3,
  FileText,
  Hash,
  Loader2,
  Menu,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
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

interface QuestionPrediction {
  questionId: number;
  questionText: string;
  result: Result | null;
  loading: boolean;
  error: string | null;
}

const NewOptimizePageTab: React.FC<OptimizePageTabProps> = ({
  surveyDetails,
  onBrandSelect,
}) => {
  const [selectedPayload, setSelectedPayload] =
    useState<CreateSearchPayload | null>(null);
  const [brandUrl, setBrandUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState<string>("");
  const [questionPredictions, setQuestionPredictions] = useState<
    QuestionPrediction[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize question predictions
    if (surveyDetails?.Questions) {
      setQuestionPredictions(
        surveyDetails.Questions.map((q) => ({
          questionId: q.Id,
          questionText: q.Text,
          result: null,
          loading: false,
          error: null,
        }))
      );
    }
  }, [surveyDetails?.Questions]);

  const triggerPredictions = async (brandName: string, url: string) => {
    if (
      !url ||
      !surveyDetails?.Questions ||
      surveyDetails.Questions.length === 0
    ) {
      return;
    }

    // Set all questions to loading state
    setQuestionPredictions((prev) =>
      prev.map((qp) => ({
        ...qp,
        loading: true,
        error: null,
      }))
    );

    try {
      // Fetch batch predictions for all questions at once
      const response: RankingAnalysisResponse = await getBatchPrediction(
        brandName,
        url,
        surveyDetails.Questions
      );

      console.log("Batch prediction response:", response);

      // Create a map of item_index to result for quick lookup
      const resultMap = new Map<number, Result>();
      response.results.forEach((result) => {
        resultMap.set(result.item_index, result);
      });

      console.log("Result map:", resultMap);
      console.log("Total results:", response.results.length);
      console.log("Successful predictions:", response.successful_predictions);

      // Update predictions for each question using item_index
      setQuestionPredictions((prev) =>
        prev.map((qp, index) => {
          const result = resultMap.get(index);
          console.log(`Question ${index} (ID: ${qp.questionId}):`, result);
          if (result && result.success) {
            return {
              ...qp,
              result: result,
              loading: false,
              error: null,
            };
          }
          return {
            ...qp,
            result: result || null,
            loading: false,
            error: result
              ? "Prediction failed for this question"
              : "No prediction data received",
          };
        })
      );
    } catch (error) {
      console.error("Error fetching batch predictions:", error);
      // Set error state for all questions
      setQuestionPredictions((prev) =>
        prev.map((qp) => ({
          ...qp,
          result: null,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch predictions",
        }))
      );
    }
  };

  const handleBrandSelect = async (searchPayload: CreateSearchPayload) => {
    setSelectedPayload(searchPayload);
    // Reset predictions and URL when brand changes
    setQuestionPredictions(
      surveyDetails?.Questions?.map((q) => ({
        questionId: q.Id,
        questionText: q.Text,
        result: null,
        loading: false,
        error: null,
      })) || []
    );
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

  const getTasksFromResult = (result: Result, questionId: number) => {
    const tasks: Array<{
      id: string;
      title: string;
      description: string;
      impact: "high" | "normal";
      category: string;
      categoryIcon: React.ReactNode;
      categoryColor: string;
    }> = [];

    // Add action priorities as tasks
    if (result.enhanced?.action_priorities) {
      result.enhanced.action_priorities.forEach((action, index) => {
        const impactLevel =
          action.impact === "CRITICAL" || action.impact === "HIGH"
            ? "high"
            : "normal";
        tasks.push({
          id: `q${questionId}-action-${index}`,
          title: action.action || "Optimization task",
          description: `${action.current_state} → ${action.target_state}. ${action.estimated_improvement}`,
          impact: impactLevel,
          category: action.priority ? `Priority ${action.priority}` : "Content",
          categoryIcon: <Edit3 className="w-3 h-3" />,
          categoryColor: "text-orange-600",
        });
      });
    }

    // Add keyword suggestions
    if (result.suggestions?.description?.keywords) {
      result.suggestions.description.keywords.forEach((keyword, index) => {
        const impactLevel =
          keyword.priority === "CRITICAL" || keyword.priority === "HIGH"
            ? "high"
            : "normal";
        tasks.push({
          id: `q${questionId}-keyword-${index}`,
          title: keyword.suggestion || "Add keywords",
          description: `${keyword.current_state} → ${keyword.target_state}. ${keyword.impact}`,
          impact: impactLevel,
          category: "Keywords",
          categoryIcon: <Hash className="w-3 h-3" />,
          categoryColor: "text-blue-600",
        });
      });
    }

    // Add readability suggestions
    if (result.suggestions?.description?.readability) {
      result.suggestions.description.readability.forEach(
        (readability, index) => {
          const impactLevel =
            readability.priority === "CRITICAL" ||
            readability.priority === "HIGH"
              ? "high"
              : "normal";
          tasks.push({
            id: `q${questionId}-readability-${index}`,
            title: readability.suggestion || "Improve readability",
            description: `${readability.current_state} → ${readability.target_state}. ${readability.impact}`,
            impact: impactLevel,
            category: "Readability",
            categoryIcon: <FileText className="w-3 h-3" />,
            categoryColor: "text-green-600",
          });
        }
      );
    }

    // Add content suggestions from description.content
    if (result.suggestions?.description?.content) {
      result.suggestions.description.content.forEach((content, index) => {
        // Check if content has priority property (not all DescriptionContent types have it)
        const priority = "priority" in content ? content.priority : undefined;
        const impactLevel =
          priority === "CRITICAL" || priority === "HIGH" ? "high" : "normal";
        tasks.push({
          id: `q${questionId}-content-${index}`,
          title: content.title || content.action || "Improve content",
          description: content.summary || content.suggestion || "",
          impact: impactLevel,
          category: "Content",
          categoryIcon: <FileText className="w-3 h-3" />,
          categoryColor: "text-green-600",
        });
      });
    }

    // Add structure suggestions
    if (result.suggestions?.description?.structure) {
      result.suggestions.description.structure.forEach((structure, index) => {
        // Structure types always have priority property
        const impactLevel =
          structure.priority === "CRITICAL" || structure.priority === "HIGH"
            ? "high"
            : "normal";
        tasks.push({
          id: `q${questionId}-structure-${index}`,
          title: structure.title || structure.action || "Improve structure",
          description: structure.summary || structure.suggestion || "",
          impact: impactLevel,
          category: "Structure",
          categoryIcon: <Edit3 className="w-3 h-3" />,
          categoryColor: "text-orange-600",
        });
      });
    }

    return tasks;
  };

  const allTasks = questionPredictions
    .filter((qp) => qp.result && qp.result.success)
    .flatMap((qp) => getTasksFromResult(qp.result!, qp.questionId));

  // Debug: Log tasks and results
  console.log("All tasks:", allTasks);
  console.log(
    "Question predictions with results:",
    questionPredictions.filter((qp) => qp.result && qp.result.success)
  );

  // Get average current rank from all successful predictions
  const successfulResults = questionPredictions.filter(
    (qp) => qp.result && qp.result.success
  );
  const currentRank =
    successfulResults.length > 0
      ? successfulResults.reduce(
          (sum, qp) =>
            sum +
            (qp.result?.prediction?.current_rank ??
              qp.result?.prediction?.predicted_rank ??
              0),
          0
        ) / successfulResults.length
      : 12.0;

  // Get average predicted rank
  const predictedRank =
    successfulResults.length > 0
      ? successfulResults.reduce(
          (sum, qp) => sum + (qp.result?.prediction?.predicted_rank ?? 0),
          0
        ) / successfulResults.length
      : null;

  // Get average content quality score
  const contentQuality =
    successfulResults.length > 0
      ? successfulResults.reduce(
          (sum, qp) =>
            sum + (qp.result?.enhanced?.content_quality?.overall_score ?? 0),
          0
        ) / successfulResults.length
      : 58;

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

        <div className="bg-gray-100 rounded-[20px] shadow-sm border border-gray-200">
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">Current rank</div>

            <div className="pt-24 flex items-end justify-between gap-2">
              <div className="text-[19px] font-normal">
                {currentRank.toFixed(1)}
              </div>
              {predictedRank && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    {predictedRank.toFixed(1)}
                  </span>
                  <span className="text-gray-400">expected rank</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">Content quality</div>

            <div className="pt-24 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2 mb-2">
                <Menu className="w-4 h-4 text-orange-600" />
                <span className="text-gray-600 text-[19px] font-normal">
                  {contentQuality}
                </span>
                <span className="text-gray-300 text-[19px] font-light">
                  / 100
                </span>
              </div>
              <div className="text-sm text-gray-800">
                {allTasks.length} tasks{" "}
                <span className="text-gray-300">to increase your score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Tasks */}
      <div className="flex-1">
        <div className="bg-gray-100 rounded-[20px] shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Your tasks
              </span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {allTasks.length}
              </span>
              {questionPredictions.some((qp) => qp.loading) && (
                <span className="text-xs text-gray-500">
                  Loading predictions...
                </span>
              )}
            </div>
          </div>

          <div className="">
            {questionPredictions.some((qp) => qp.loading) ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                <p className="text-sm text-gray-600">
                  Analyzing predictions...
                </p>
              </div>
            ) : allTasks.length > 0 ? (
              allTasks.map((task) => (
                <div
                  key={task.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors bg-white rounded-[20px] shadow-sm border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 px-3 py-2 text-sm bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-white focus:border-transparent"
                    />

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

                        <div className="flex items-center gap-1.5">
                          <span className={task.categoryColor}>
                            {task.categoryIcon}
                          </span>
                          <span
                            className={`text-xs font-medium ${task.categoryColor}`}
                          >
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : selectedPayload ? (
              <div className="px-6 py-4 bg-white rounded-[20px] shadow-sm border border-gray-200">
                {questionPredictions.some((qp) => qp.error) ? (
                  <div className="space-y-2">
                    {questionPredictions
                      .filter((qp) => qp.error)
                      .map((qp) => (
                        <p key={qp.questionId} className="text-sm text-red-600">
                          Error for "{qp.questionText}": {qp.error}
                        </p>
                      ))}
                  </div>
                ) : questionPredictions.some(
                    (qp) => qp.result && qp.result.success
                  ) ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 text-center mb-2">
                      Predictions received but no tasks generated. Check console
                      for details.
                    </p>
                    {questionPredictions
                      .filter((qp) => qp.result && qp.result.success)
                      .map((qp) => (
                        <div
                          key={qp.questionId}
                          className="text-xs text-gray-500 p-2 bg-gray-50 rounded"
                        >
                          <p className="font-medium">
                            Question: {qp.questionText}
                          </p>
                          <p>
                            Predicted Rank:{" "}
                            {qp.result?.prediction?.predicted_rank}
                          </p>
                          <p>
                            Actions:{" "}
                            {qp.result?.enhanced?.action_priorities?.length ||
                              0}
                          </p>
                          <p>
                            Keywords:{" "}
                            {qp.result?.suggestions?.description?.keywords
                              ?.length || 0}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center">
                    No predictions available. Please submit to fetch
                    predictions.
                  </p>
                )}
              </div>
            ) : (
              <div className="px-6 py-4 bg-white rounded-[20px] shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Select a brand to see optimization recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOptimizePageTab;
