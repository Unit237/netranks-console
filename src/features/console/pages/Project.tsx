import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { canViewBilling, canManageMembers } from "../../../app/utils/userRole";
import { useUser } from "../../auth/context/UserContext";
import ProjectDetails from "../../project/pages/ProjectDetails";
import BillingTab from "../../settings/components/BillingTab";
import ProjectMembersTab from "../../project/components/tabs/ProjectMembersTab";

const Project = () => {
  const { user } = useUser();
  const { projectId: projectIdParam } = useParams<{ projectId?: string }>();
  
  // Use projectId from URL params if available, otherwise fall back to active project
  const projectId = projectIdParam 
    ? parseInt(projectIdParam, 10) 
    : (user?.Projects?.find((p) => p.IsActive)?.Id || user?.Projects?.[0]?.Id);
  
  const canView = canViewBilling(user, projectId);
  const canViewMembers = canManageMembers(user, projectId);
  
  const [activeTab, setActiveTab] = useState<"ProjectDetails" | "Members" | "Billing">(
    "ProjectDetails"
  );

  // Reset to ProjectDetails if user cannot view billing/members and tab is set to those tabs
  useEffect(() => {
    if ((!canView && activeTab === "Billing") || (!canViewMembers && activeTab === "Members")) {
      setActiveTab("ProjectDetails");
    }
  }, [canView, canViewMembers, activeTab]);

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
            {canViewMembers && (
              <button
                onClick={() => setActiveTab("Members")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "Members"
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Members
              </button>
            )}
            {canView && (
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
            )}
          </div>
        </div>

        {activeTab === "ProjectDetails" && <ProjectDetails />}

        {activeTab === "Members" && canViewMembers && projectId && (
          <ProjectMembersTab projectId={projectId} />
        )}

        {activeTab === "Billing" && canView && <BillingTab />}
      </div>
    </div>
  );
};

export default Project;
