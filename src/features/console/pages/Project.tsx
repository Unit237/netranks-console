import { useState } from "react";
import Prediction from "../../prediction/pages/Prdiction";
import ProjectDetails from "../../project/pages/ProjectDetails";
import BillingTab from "../../settings/components/BillingTab";

const Project = () => {
  const [activeTab, setActiveTab] = useState<
    "ProjectDetails" | "Billing" | "Prediction"
  >("ProjectDetails");

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="w-full mx-auto p-4">
        {/* Header with tabs */}
        <div className="mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab("ProjectDetails")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "ProjectDetails"
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Project
            </button>
            <button
              onClick={() => setActiveTab("Billing")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "Billing"
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Billing
            </button>
            {/* <button
              onClick={() => setActiveTab("Prediction")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "Prediction"
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Prediction
            </button> */}
          </div>
        </div>

        {activeTab === "ProjectDetails" && <ProjectDetails />}

        {activeTab === "Billing" && <BillingTab />}

        {activeTab === "Prediction" && <Prediction />}
      </div>
    </div>
  );
};

export default Project;
