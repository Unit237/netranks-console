import { Plus } from "lucide-react";
import { useMemo } from "react";
import ErrorBoundary from "../../../app/components/ErrorBoundary";
import { useUser } from "../../auth/context/UserContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { TabRouteParamsProvider } from "../context/TabRouteParamsContext";
import { useTabs } from "../context/TabContext";
import { getComponentForPath } from "../utils/tabComponentRegistry";

const Console = () => {
  const { tabs, activeTabId, addTab } = useTabs();
  const { useActiveProjectId } = useUser();

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
    // Note: We don't navigate anymore - tab switching is instant
  };

  // Render all tabs but only show the active one
  const renderedTabs = useMemo(() => {
    return tabs.map((tab) => {
      const componentData = getComponentForPath(tab.path);
      if (!componentData) {
        return null;
      }

      const { component: Component, params = {} } = componentData;
      const isActive = tab.id === activeTabId;

      return (
        <div
          key={tab.id}
          style={{
            display: isActive ? "block" : "none",
            height: "100%",
            width: "100%",
          }}
          className="tab-content"
        >
          <TabRouteParamsProvider params={params}>
            <ErrorBoundary>
              <Component path={tab.path} params={params} />
            </ErrorBoundary>
          </TabRouteParamsProvider>
        </div>
      );
    });
  }, [tabs, activeTabId]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          {tabs.length === 0 ? (
            <main className="flex-1 overflow-auto flex items-center justify-center">
              <button
                onClick={handleCreateNewSurvey}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create new survey</span>
              </button>
            </main>
          ) : (
            <main className="flex-1 overflow-auto bg-white dark:bg-gray-900 relative">
              {renderedTabs}
            </main>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Console;
