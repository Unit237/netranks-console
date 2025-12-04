import { useState } from "react";
import ProfileTab from "../components/ProfileTab";
import WorkspaceTab from "../components/WorkspaceTab";
import BillingTab from "../components/BillingTab";

type TabType = "profile" | "workspace" | "billing";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile" as TabType, label: "Profile" },
    { id: "workspace" as TabType, label: "Workspace" },
    { id: "billing" as TabType, label: "Billing" },
  ];

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "workspace" && <WorkspaceTab />}
          {activeTab === "billing" && <BillingTab />}
        </div>
      </div>
    </div>
  );
};

export default Settings;

