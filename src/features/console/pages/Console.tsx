import { Plus } from "lucide-react";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useTabs } from "../context/TabContext";

const Console = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tabs, activeTabId, setActiveTab, addTab } = useTabs();

  const handleCreateNewSurvey = () => {
    addTab({
      name: "untitled survey",
      path: "/console/brand",
      headerName: "untitled survey",
    });
    navigate("/console/brand");
  };

  // Sync active tab with current route
  useEffect(() => {
    // Only sync if there are tabs
    if (tabs.length === 0) return;

    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    if (currentTab && currentTab.id !== activeTabId) {
      setActiveTab(currentTab.id);
    } else if (!currentTab && location.pathname.startsWith("/console")) {
      // If navigating to a console route without a tab, create one
      const pathSegments = location.pathname.split("/");
      const routeName = pathSegments[pathSegments.length - 1] || "dashboard";
      const tabName =
        routeName.charAt(0).toUpperCase() +
        routeName.slice(1).replace(/-/g, " ");

      addTab({
        name: tabName,
        path: location.pathname,
        headerName: tabName,
      });
    }
  }, [location.pathname, tabs, activeTabId, setActiveTab, addTab]);

  return (
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
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
};

export default Console;
