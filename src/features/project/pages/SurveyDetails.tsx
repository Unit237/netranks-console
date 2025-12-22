import { useEffect, useState } from "react";
import { useParams } from "../../console/context/TabRouteParamsContext";
import { useTabs } from "../../console/context/TabContext";
import type { SurveyDetails as SurveyDetailsType } from "../@types";
import type { CreateSearchPayload } from "../@types/optimization";
import type { RankingAnalysisResponse } from "../@types/prediction";
import NewOptimizePageTab from "../components/tabs/NewOptimizePageTab";
import QuestionPageTab from "../components/tabs/NewQuestionTab";
import OverviewPageTab from "../components/tabs/OverviewPageTab";
import { getSurveyMainDashboard } from "../services/optimizeService";
import { getSurveyById } from "../services/projectService";
import { sanitizeSurveyName } from "../utils/sanitizeSurveyName";

const SurveyDetails = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { addTab } = useTabs();

  const [activeTab, setActiveTab] = useState<
    "Overview" | "Questions" | "Optimize"
  >("Overview");

  const [surveyDetails, setSurveyDetails] = useState<SurveyDetailsType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batchResponse, setBatchResponse] = useState<RankingAnalysisResponse | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<CreateSearchPayload | null>(null);
  const [brandUrl, setBrandUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState<string>("");

  const fetchProjectDetails = async () => {
    if (!surveyId) {
      setError("Invalid survey ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getSurveyById(parseInt(surveyId, 10));

      if (!res) {
        setError("Survey not found.");
      } else {
        setSurveyDetails(res);
        // Add tab to header when survey details are successfully fetched
        const cleanedName = sanitizeSurveyName(res.Name) || "Survey Details";
        addTab({
          name: cleanedName,
          path: `/console/survey/${surveyId}`,
          headerName: cleanedName,
        });
      }
    } catch (err) {
      console.error("Error fetching survey details:", err);
      setError("Failed to load survey details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = async (searchPayload: CreateSearchPayload) => {
    // Store the selected payload so it persists across remounts
    setSelectedPayload(searchPayload);

    if (!surveyId || !surveyDetails) return;

    try {
      setLoading(true);
      const dashboardData = await getSurveyMainDashboard(
        parseInt(surveyId, 10),
        searchPayload
      );


      if (dashboardData) {
        setSurveyDetails((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            Dashboard: dashboardData,
          };
        });
      }
    } catch (err) {
      console.error("Error fetching survey dashboard:", err);
      setError("Failed to load survey dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [surveyId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  // No data (should not happen but safe)
  if (!surveyDetails) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">
        No survey details available.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="w-full mx-auto p-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {["Overview", "Questions", "Optimize"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs Content */}
        <div className={activeTab === "Overview" ? "" : "hidden"}>
          <OverviewPageTab surveyDetails={surveyDetails} />
        </div>

        <div className={activeTab === "Questions" ? "" : "hidden"}>
          <QuestionPageTab
            questions={surveyDetails.Questions || []}
            surveyId={surveyDetails.Id}
            onQuestionsUpdate={fetchProjectDetails}
          />
        </div>

        <div className={activeTab === "Optimize" ? "" : "hidden"}>
          <NewOptimizePageTab
            key={`optimize-${surveyDetails?.Id}`}
            surveyDetails={surveyDetails}
            batchResponse={batchResponse}
            onBatchResponseChange={setBatchResponse}
            selectedPayload={selectedPayload}
            onSelectedPayloadChange={setSelectedPayload}
            brandUrl={brandUrl}
            onBrandUrlChange={setBrandUrl}
            manualUrl={manualUrl}
            onManualUrlChange={setManualUrl}
            onBrandSelect={handleBrandSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default SurveyDetails;
