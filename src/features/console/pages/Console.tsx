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
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {tabs.length === 0 && location.pathname.endsWith("/console") ? (
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
          <main className="flex-1 overflow-auto bg-white dark:bg-gray-900">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
};

export default Console;
