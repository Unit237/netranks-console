import { useState } from "react";
import { useParams } from "react-router-dom";
import OptimizePageTab from "../components/tabs/OptimizePageTab";
import OverviewPageTab from "../components/tabs/OverviewPageTab";
import QuestionPageTab from "../components/tabs/QuestionPageTab";

const SurveyDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Questions" | "Optimize"
  >("Overview");

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
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

        {activeTab === "Overview" && <OverviewPageTab />}

        {activeTab === "Questions" && <QuestionPageTab />}

        {activeTab === "Optimize" && <OptimizePageTab />}
      </div>
    </div>
  );
};

export default SurveyDetails;
