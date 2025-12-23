import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import prms from "../../../../app/shared/utils/prms";
import SegmentCard from "../../../prediction/components/ui/SegmentCard";
import type { Segment } from "../../../prediction/components/ui/SegmentDetailModal";
import SegmentDetailModal from "../../../prediction/components/ui/SegmentDetailModal";
import type { CreateSearchPayload } from "../../@types/optimization";
import type { SurveyDetails } from "../../@types";

interface Task {
  id: string;
  title: string;
  description: string;
  impact: "high" | "normal";
  completed?: boolean;
}

interface TasksTabMenuProps {
  tasks: Task[];
  selectedPayload: CreateSearchPayload | null;
  selectedQuestion: { Id: number; Text: string } | null;
  surveyDetails: SurveyDetails;
  manualUrl: string;
  brandUrl: string | null;
}

type TabType = "all" | "helping" | "hurting";

interface AnalysisResult {
  success: boolean;
  top_helping?: Segment[];
  top_hurting?: Segment[];
  error?: string;
}

const TasksTabMenu: React.FC<TasksTabMenuProps> = ({
  tasks,
  selectedPayload,
  selectedQuestion,
  surveyDetails,
  manualUrl,
  brandUrl,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  // Reset analysis result when payload changes
  useEffect(() => {
    setAnalysisResult(null);
  }, [selectedPayload?.BrandName, selectedQuestion?.Id, manualUrl, brandUrl]);

  // Fetch analysis data when switching to helping or hurting tabs
  useEffect(() => {
    const fetchAnalysis = async () => {
      // Only fetch if we're on helping or hurting tab and haven't fetched yet
      if (activeTab === "helping" || activeTab === "hurting") {
        if (!analysisResult) {
          await loadAnalysisData();
        }
      }
    };

    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadAnalysisData = async () => {
    const brandName = selectedPayload?.BrandName || "";
    const url = manualUrl.trim() || brandUrl || "";

    if (!brandName || !url) {
      setAnalysisResult({
        success: false,
        error: "Brand name and URL are required",
      });
      return;
    }

    // Use selected question if available, otherwise use first question or empty
    const questionText = selectedQuestion
      ? selectedQuestion.Text
      : surveyDetails?.Questions?.[0]?.Text || "";

    if (!questionText) {
      setAnalysisResult({
        success: false,
        error: "Question is required",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Normalize URL to ensure it has a protocol
      const normalizeUrl = (url: string): string => {
        if (!url || typeof url !== "string") return url;
        const trimmed = url.trim();
        if (!trimmed) return trimmed;

        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          return trimmed;
        }

        return `https://${trimmed}`;
      };

      const normalizedUrl = normalizeUrl(url);

      const response = await fetch(`${prms.API_BASE_URL}/analyze-segments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: questionText,
          suggest_name: brandName,
          url_title: brandName,
          url: normalizedUrl,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to fetch analysis";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setAnalysisResult({
        success: true,
        top_helping: result.top_helping || [],
        top_hurting: result.top_hurting || [],
      });
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setAnalysisResult({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch analysis",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-[20px] shadow-sm border border-gray-200">
      {/* Tab Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your tasks
            </span>
            <div className="flex gap-1">
              {[
                { key: "all" as TabType, label: "All Tasks" },
                { key: "helping" as TabType, label: "Top Helping" },
                { key: "hurting" as TabType, label: "Top Hurting" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 text-sm font-medium
                    transition-all duration-300
                    ${
                      activeTab === tab.key
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }
                  `}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500 rounded-full transition-all duration-300"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium">
            {activeTab === "all"
              ? tasks.length
              : activeTab === "helping"
              ? analysisResult?.top_helping?.length || 0
              : analysisResult?.top_hurting?.length || 0}
          </span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-2 p-2">
        {activeTab === "all" && (
          <>
            {tasks.length > 0 ? (
              tasks.map((task) => (
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
              ))
            ) : (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    No tasks available.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "helping" && (
          <>
            {isLoading ? (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            ) : analysisResult?.top_helping &&
              analysisResult.top_helping.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4 px-4">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Top Segments Helping Visibility
                  </h3>
                </div>
                {analysisResult.top_helping.map((segment, idx) => (
                  <div key={idx} className="px-4">
                    <SegmentCard
                      segment={segment}
                      rank={idx + 1}
                      type="helping"
                      onClick={setSelectedSegment}
                    />
                  </div>
                ))}
              </div>
            ) : analysisResult?.error ? (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <p className="text-sm text-red-600">
                    Error: {analysisResult.error}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    No helping segments found. Please submit to fetch analysis.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "hurting" && (
          <>
            {isLoading ? (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            ) : analysisResult?.top_hurting &&
              analysisResult.top_hurting.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4 px-4">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Top Segments Hurting Visibility
                  </h3>
                </div>
                {analysisResult.top_hurting.map((segment, idx) => (
                  <div key={idx} className="px-4">
                    <SegmentCard
                      segment={segment}
                      rank={idx + 1}
                      type="hurting"
                      onClick={setSelectedSegment}
                    />
                  </div>
                ))}
              </div>
            ) : analysisResult?.error ? (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <p className="text-sm text-red-600">
                    Error: {analysisResult.error}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    No hurting segments found. Please submit to fetch analysis.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Segment Detail Modal */}
      {selectedSegment && (
        <SegmentDetailModal
          segment={selectedSegment}
          onClose={() => setSelectedSegment(null)}
        />
      )}
    </div>
  );
};

export default TasksTabMenu;

