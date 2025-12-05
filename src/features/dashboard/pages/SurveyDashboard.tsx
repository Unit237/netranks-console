import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toPercentage } from "../../../app/utils/utils";
import type { SurveyStatsResponse } from "../@types";
import SampleAiAnswerSnippet from "../components/SampleAiAnswerSnippet";
import OptimizePageTab from "../components/surveyDashTabs/OptimizePageTab";
import OverviewPageTab from "../components/surveyDashTabs/OverviewPageTab";
import QuestionPageTab from "../components/surveyDashTabs/QuestionPageTab";
import { getSurveyRunForDashboard } from "../services/dashService";

const SurveyDashboard: React.FC = () => {
  const params = useParams();
  const { surveyRunId, p1, p2 } = params;
  const [data, setData] = useState<SurveyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllCitations, setShowAllCitations] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Questions" | "Optimize"
  >("Overview");

  const navigate = useNavigate();

  // Check if user is authenticated
  // Note: Anyone navigating to SurveyDashboard in console is not authenticated
  const isAuthenticated = () => {
    return false;
  };

  // Handle click to redirect to signin if not authenticated
  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      e.stopPropagation();
      navigate("/signin");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getSurveyRunForDashboard(surveyRunId, p1, p2);
        console.log(response);
        setData(response);
      } catch (error) {
        console.error("Failed to fetch survey dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (surveyRunId && p1 && p2) {
      fetchData();
    }
  }, [surveyRunId, p1, p2]);

  if (loading) {
    return (
      <div
        onClick={!isAuthenticated() ? handleClick : undefined}
        className={`h-full overflow-auto bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${
          !isAuthenticated() ? "cursor-pointer" : ""
        }`}
      >
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        onClick={!isAuthenticated() ? handleClick : undefined}
        className={`h-full overflow-auto bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${
          !isAuthenticated() ? "cursor-pointer" : ""
        }`}
      >
        <div className="text-gray-600 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const displayedCitations = showAllCitations
    ? data.TopCitationsInAiAnswers
    : data.TopCitationsInAiAnswers.slice(0, 5);

  const goToSignUp = () => {
    navigate("/signin");
  };

  const mainContent = (
    <div className="h-full overflow-auto">
      <div className="mx-auto p-6">
        <div className="flex gap-6">
          {/* Column 1 */}
          <div className="space-y-6 w-[50vw]">
            {/* Top Brands in AI Answers */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
                Top brands in AI answers
              </h2>
              <div className="">
                {data.TopBrandsInAiAnswers.map((brand, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 rounded-[20px] border border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-6">
                        {index + 1}.
                      </span>
                      <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                        {brand.Name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {brand.Name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {toPercentage(brand.Percentage)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Citations in AI Answers */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
                Top citations in AI answers
              </h2>
              <div className="">
                {displayedCitations.map((citation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 rounded-[20px] border border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-6">
                        {index + 1}.
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {citation.RegistrableDomain}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {toPercentage(citation.Percentage)}
                    </span>
                  </div>
                ))}
              </div>
              {data.TopCitationsInAiAnswers.length > 5 && (
                <div className="p-4">
                  <button
                    onClick={(e) => {
                      if (!isAuthenticated()) {
                        e.stopPropagation();
                        goToSignUp();
                        return;
                      }
                      setShowAllCitations(!showAllCitations);
                    }}
                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {showAllCitations ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show More
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Actual AI Answers for Survey */}

            <SampleAiAnswerSnippet survey={data} />
          </div>

          {/* Column 2 */}
          <div className="space-y-6 w-[30vw]">
            {/* Survey Stats Overview */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
                Survey Stats Overview
              </h2>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Queries Run
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
                    {data.SurveyStatsOverview.QueriesRun}
                  </p>
                </div>
                <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Prompt Variations
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
                    {data.SurveyStatsOverview.PromptVariations}
                  </p>
                </div>
                <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Brands Identified
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
                    {data.SurveyStatsOverview.BrandsIdentified}
                  </p>
                </div>
                <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Survey Depth
                  </p>

                  {/* Percentage Text */}
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-100 mb-2">
                    {toPercentage(data.SurveyStatsOverview.SurveyDepth)}
                  </p>

                  {/* Percentage Bar */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 dark:bg-orange-400 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (data.SurveyStatsOverview.SurveyDepth ?? 0) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Visibility Score - Choose Your Brand to Track */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
                AI visibility score - choose your brand to track
              </h2>
              <div className="relative">
                <div className="blur-sm">
                  <div className="p-4 space-y-4">
                    {/* Sample brand selection cards */}
                    {data.TopBrandsInAiAnswers.slice(0, 3).map(
                      (brand, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200 dark:border-gray-700 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                {brand.Name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {brand.Name}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {toPercentage(brand.Percentage)}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                {/* Banner Overlay */}
                <div
                  onClick={(e) => {
                    if (!isAuthenticated()) {
                      e.stopPropagation();
                    }
                    goToSignUp();
                  }}
                  className="absolute inset-0 flex items-center justify-center rounded-[20px]"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        Activate full access to view your AI visibility score.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap content in click handler if not authenticated
  if (!isAuthenticated()) {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        <div className="w-full mx-auto p-6">
          {/* Header with tabs */}
          <div className="mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab("Overview")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "Overview"
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("Questions")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "Questions"
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab("Optimize")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "Optimize"
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Optimize
              </button>
            </div>
          </div>

          {activeTab === "Overview" && <OverviewPageTab surveyStats={data} />}

          {activeTab === "Questions" && <QuestionPageTab surveyStats={data} />}

          {activeTab === "Optimize" && <OptimizePageTab surveyStats={data} />}
        </div>
        {mainContent}
      </div>
    );
  }

  return mainContent;
};

export default SurveyDashboard;
