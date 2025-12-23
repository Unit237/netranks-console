import { Plus } from "lucide-react";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ErrorBoundary from "../../../app/components/ErrorBoundary";
import { canCreateSurveys } from "../../../app/utils/userRole";
import { useUser } from "../../auth/context/UserContext";
import Header from "../components/Header";
import MobileBanner from "../components/MobileBanner";
import Sidebar from "../components/Sidebar";
import { useTabs } from "../context/TabContext";

const Console = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tabs, activeTabId, setActiveTab, addTab } = useTabs();
  const { user, useActiveProjectId } = useUser();

  const handleCreateNewSurvey = () => {
    // Get the active project ID (or first project if none active)
    const projectId = useActiveProjectId();

    if (!projectId) {
      // No projects available, can't create survey
      console.warn("No projects available to create survey");
      return;
    }

    addTab({
      name: "New Survey",
      path: `/console/new-survey/${projectId}`,
      headerName: "New Survey",
    });
    navigate(`/console/new-survey/${projectId}`);
  };

  // Sync active tab with current route
  useEffect(() => {
    // Only sync if there are tabs
    if (tabs.length === 0) {
      // Clear active tab if no tabs exist
      if (activeTabId !== null) {
        setActiveTab(null);
      }
      return;
    }

    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    if (currentTab) {
      // Only update if the active tab is different to prevent infinite loops
      if (currentTab.id !== activeTabId) {
        setActiveTab(currentTab.id);
      }
    } else {
      // Clear active tab if current route doesn't match any tab
      if (activeTabId !== null) {
        setActiveTab(null);
      }
    }
    // Don't auto-create tabs here - let components handle tab creation explicitly
    // This prevents infinite loops when navigating programmatically
  }, [location.pathname, tabs, activeTabId, setActiveTab]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <MobileBanner />
          {tabs.length === 0 && location.pathname.endsWith("/console") ? (
            <main className="flex-1 overflow-auto flex items-center justify-center">
              {canCreateSurveys(user, useActiveProjectId()) ? (
                <button
                  onClick={handleCreateNewSurvey}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create new survey</span>
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    You don't have permission to create surveys.
                  </p>
                </div>
              )}
            </main>
          ) : (
            <main className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Console;
