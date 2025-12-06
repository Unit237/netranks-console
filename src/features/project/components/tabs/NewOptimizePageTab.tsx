import {
  AlertCircle,
  Edit3,
  FileText,
  Hash,
  Menu,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { searchBrands } from "../../../brand-rank/services/brandService";
import type { PredictionData } from "../../../prediction/refactor/Brand";
import type { SurveyDetails } from "../../@types";
import type { CreateSearchPayload } from "../../@types/optimization";
import { getPrediction } from "../../services/optimizeService";
import BrandDropdownMenu from "../BrandDropdownMenu";

interface OptimizePageTabProps {
  surveyDetails: SurveyDetails;
  onBrandSelect?: (searchPayload: CreateSearchPayload) => void;
}

interface QuestionPrediction {
  questionId: number;
  questionText: string;
  prediction: PredictionData | null;
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

  useEffect(() => {
    // Initialize question predictions
    if (surveyDetails?.Questions) {
      setQuestionPredictions(
        surveyDetails.Questions.map((q) => ({
          questionId: q.Id,
          questionText: q.Text,
          prediction: null,
          loading: false,
          error: null,
        }))
      );
    }
  }, [surveyDetails?.Questions]);

  const triggerPredictions = (brandName: string, url: string) => {
    if (url && surveyDetails?.Questions) {
      surveyDetails.Questions.forEach((question) => {
        fetchPredictionForQuestion(question.Id, question.Text, brandName, url);
      });
    }
  };

  const handleBrandSelect = async (searchPayload: CreateSearchPayload) => {
    setSelectedPayload(searchPayload);

    // Call parent's onBrandSelect if provided
    if (onBrandSelect) {
      onBrandSelect(searchPayload);
    }

    // Search for brand URL
    if (searchPayload.BrandName) {
      try {
        const brands = await searchBrands(searchPayload.BrandName);
        const url = brands[0]?.domain || "";
        setBrandUrl(url);

        // Use manual URL as fallback if searchBrands didn't return a valid domain
        // If searchBrands returned empty and manualUrl exists, use manualUrl
        // Otherwise, if searchBrands returned a URL, use it
        const finalUrl = url && url.trim() !== "" ? url : manualUrl;

        // Fetch predictions for all questions only if we have a URL
        if (finalUrl && finalUrl.trim() !== "") {
          triggerPredictions(searchPayload.BrandName || "", finalUrl);
        }
      } catch (error) {
        console.error("Error searching brands:", error);
        setBrandUrl(null);
        // If searchBrands fails, use manual URL if available
        if (manualUrl && manualUrl.trim() !== "") {
          triggerPredictions(searchPayload.BrandName || "", manualUrl);
        }
      }
    }
  };

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url);

    // If brand is selected and URL is provided, fetch predictions
    // Use brandUrl from searchBrands if available, otherwise use manual URL
    if (selectedPayload && url && surveyDetails?.Questions) {
      const finalUrl = brandUrl && brandUrl.trim() !== "" ? brandUrl : url;
      if (finalUrl && finalUrl.trim() !== "") {
        triggerPredictions(selectedPayload.BrandName || "", finalUrl);
      }
    }
  };

  const fetchPredictionForQuestion = async (
    questionId: number,
    questionText: string,
    brandName: string,
    url: string
  ) => {
    // Update loading state for this question
    setQuestionPredictions((prev) =>
      prev.map((qp) =>
        qp.questionId === questionId
          ? { ...qp, loading: true, error: null }
          : qp
      )
    );

    try {
      const prediction = await getPrediction(brandName, url, questionText);

      // Update with prediction result
      setQuestionPredictions((prev) =>
        prev.map((qp) =>
          qp.questionId === questionId
            ? { ...qp, prediction, loading: false, error: null }
            : qp
        )
      );
    } catch (error) {
      console.error(
        `Error fetching prediction for question ${questionId}:`,
        error
      );
      setQuestionPredictions((prev) =>
        prev.map((qp) =>
          qp.questionId === questionId
            ? {
                ...qp,
                loading: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to fetch prediction",
              }
            : qp
        )
      );
    }
  };

  const getTasksFromPrediction = (
    prediction: PredictionData,
    questionId: number
  ) => {
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
    if (prediction.enhanced?.action_priorities) {
      prediction.enhanced.action_priorities.forEach((action, index) => {
        tasks.push({
          id: `q${questionId}-action-${index}`,
          title: action.title || action.action || "Optimization task",
          description: action.action || action.details?.improvement || "",
          impact: action.impact === "high" ? "high" : "normal",
          category: action.priority || "Content",
          categoryIcon: <Edit3 className="w-3 h-3" />,
          categoryColor: "text-orange-600",
        });
      });
    }

    // Add description suggestions
    if (prediction.suggestions?.description) {
      const desc = prediction.suggestions.description;
      if (desc.keywords && desc.keywords.length > 0) {
        tasks.push({
          id: `q${questionId}-keywords`,
          title: "Add keywords",
          description: `Missing keywords: ${desc.keywords.join(", ")}`,
          impact: "high",
          category: "Keywords",
          categoryIcon: <Hash className="w-3 h-3" />,
          categoryColor: "text-blue-600",
        });
      }
      if (desc.length && desc.length.length > 0) {
        tasks.push({
          id: `q${questionId}-length`,
          title: "Optimize description length",
          description: desc.length.join(" "),
          impact: "high",
          category: "Content",
          categoryIcon: <Edit3 className="w-3 h-3" />,
          categoryColor: "text-orange-600",
        });
      }
      if (desc.content && desc.content.length > 0) {
        tasks.push({
          id: `q${questionId}-content`,
          title: "Improve content",
          description: desc.content.join(" "),
          impact: "normal",
          category: "Content",
          categoryIcon: <FileText className="w-3 h-3" />,
          categoryColor: "text-green-600",
        });
      }
      if (desc.structure && desc.structure.length > 0) {
        tasks.push({
          id: `q${questionId}-structure`,
          title: "Improve structure",
          description: desc.structure.join(" "),
          impact: "normal",
          category: "Content",
          categoryIcon: <Edit3 className="w-3 h-3" />,
          categoryColor: "text-orange-600",
        });
      }
    }

    return tasks;
  };

  const allTasks = questionPredictions
    .filter((qp) => qp.prediction)
    .flatMap((qp) => getTasksFromPrediction(qp.prediction!, qp.questionId));

  const currentRank =
    questionPredictions.find((qp) => qp.prediction)?.prediction?.prediction
      ?.current_rank || 12.0;
  const predictedRank =
    questionPredictions.find((qp) => qp.prediction)?.prediction?.prediction
      ?.predicted_rank || null;
  const contentQuality =
    questionPredictions.find((qp) => qp.prediction)?.prediction?.enhanced
      ?.content_quality?.overall_score || 58;

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
              Brand URL{" "}
              {brandUrl && brandUrl.trim() !== "" ? "(fallback)" : "(required)"}
            </label>
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => handleManualUrlChange(e.target.value)}
              placeholder={
                brandUrl && brandUrl.trim() !== ""
                  ? `Using: ${brandUrl} (or enter custom URL)`
                  : "Enter brand URL"
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all"
            />
            {brandUrl && brandUrl.trim() !== "" && !manualUrl && (
              <p className="mt-1 text-xs text-gray-500">
                Using URL from search: {brandUrl}
              </p>
            )}
            {manualUrl && (
              <p className="mt-1 text-xs text-green-600">
                {brandUrl && brandUrl.trim() !== ""
                  ? `Overriding with manual URL: ${manualUrl}`
                  : `Using manual URL: ${manualUrl}`}
              </p>
            )}
            {!brandUrl && !manualUrl && (
              <p className="mt-1 text-xs text-orange-600">
                No URL found from search. Please enter a URL to continue.
              </p>
            )}
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
            {allTasks.length > 0 ? (
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
                {questionPredictions.some((qp) => qp.loading) ? (
                  <p className="text-sm text-gray-600 text-center">
                    Loading predictions for questions...
                  </p>
                ) : questionPredictions.some((qp) => qp.error) ? (
                  <div className="space-y-2">
                    {questionPredictions
                      .filter((qp) => qp.error)
                      .map((qp) => (
                        <p key={qp.questionId} className="text-sm text-red-600">
                          Error for "{qp.questionText}": {qp.error}
                        </p>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center">
                    No tasks available yet. Predictions are being processed...
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
