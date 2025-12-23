import { Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ErrorBoundary from "../../../app/components/ErrorBoundary";
import { useUser } from "../../auth/context/UserContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { TabRouteParamsProvider } from "../context/TabRouteParamsContext";
import { useTabs } from "../context/TabContext";
import { getComponentForPath } from "../utils/tabComponentRegistry";
import { getTabMetadata, getRouteConfig } from "../utils/routeConfig";

const Console = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tabs, activeTabId, addTab, setActiveTab, ensureTabForPath } = useTabs();
  const { useActiveProjectId, user } = useUser();

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

  // Get the active tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // Check if current route is a tab route or a regular route
  const currentTab = tabs.find((tab) => tab.path === location.pathname);
  const isTabRoute = currentTab !== undefined;
  const isNonTabRoute = !isTabRoute && location.pathname.startsWith("/console");

  // Sync URL with active tab when it changes
  useEffect(() => {
    if (activeTabId && activeTab && activeTab.path !== location.pathname) {
      // Update URL to match active tab (but don't cause reload)
      navigate(activeTab.path, { replace: true });
    }
  }, [activeTabId, activeTab, location.pathname, navigate]);

  // Automatically create tabs for tab-enabled routes when navigating
  useEffect(() => {
    const routeConfig = getRouteConfig(location.pathname);

    // Only create tabs for routes that should have tabs
    if (routeConfig?.shouldHaveTab) {
      const metadata = getTabMetadata(location.pathname, user);
      if (metadata) {
        // ensureTabForPath checks internally if tab exists, so safe to call directly
        ensureTabForPath(location.pathname, {
          name: metadata.name,
          headerName: metadata.headerName,
        });
      }
    }
  }, [location.pathname, user, ensureTabForPath]);

  // Sync active tab with current route (but prioritize activeTabId)
  useEffect(() => {
    if (isTabRoute && currentTab && currentTab.id !== activeTabId) {
      setActiveTab(currentTab.id);
    }
    // For non-tab routes, we don't change the active tab - just show the Outlet content
  }, [location.pathname, isTabRoute, currentTab, activeTabId, setActiveTab]);

  // Render all tabs but only show the active one
  const renderedTabs = useMemo(() => {
    return tabs.map((tab) => {
      const componentData = getComponentForPath(tab.path);
      if (!componentData) {
        return null;
      }

      const { component: Component, params = {} } = componentData;
      // Show tab if it's the active tab (regardless of URL matching)
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
  }, [tabs, activeTabId, isTabRoute]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          {tabs.length === 0 && !isNonTabRoute ? (
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
              {/* Render tabs if there are any */}
              {tabs.length > 0 && renderedTabs}
              {/* Render Outlet for non-tab routes (settings, members, etc.) */}
              {isNonTabRoute && (
                <div className="h-full w-full">
                  <ErrorBoundary>
                    <Outlet />
                  </ErrorBoundary>
                </div>
              )}
            </main>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Console;
