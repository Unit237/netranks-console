import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthManager from "../../../app/auth/AuthManager";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../context/TabContext";

const Header = () => {
  const { tabs, activeTabId, closeTab, closeAllTabs, setActiveTab, addTab } =
    useTabs();
  const navigate = useNavigate();
  const { user, useActiveProjectId } = useUser();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const authToken = AuthManager.getAnyToken();
    return !!authToken && !!user;
  };

  // Handle click to redirect to signin if not authenticated
  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      e.stopPropagation();
      navigate("/signin");
    }
  };

  const handleAddTab = () => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }

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

  const handleTabClick = (tabId: string, path: string) => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }
    setActiveTab(tabId);
    navigate(path);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();

    // If closing active tab, navigate to the new active tab or dashboard
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter((t) => t.id !== tabId);
      if (remainingTabs.length > 0) {
        const currentIndex = tabs.findIndex((t) => t.id === tabId);
        const newActiveIndex = Math.min(currentIndex, remainingTabs.length - 1);
        const newActiveTab = remainingTabs[newActiveIndex];
        navigate(newActiveTab.path);
      } else {
        navigate("/console");
      }
    }

    closeTab(tabId);
  };

  const handleCloseAllTabs = () => {
    closeAllTabs();
    // Don't navigate - let the empty state show
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-gray-200 dark:bg-gray-900 flex items-center gap-2 pr-4 pt-2 overflow-x-auto border-b border-gray-300 dark:border-gray-700 ${
        !isAuthenticated() ? "cursor-pointer" : ""
      }`}
    >
      {tabs.length > 0 && (
        <>
          <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;

              return (
                <div
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap relative group cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border-t-2 border-blue-500"
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {tab.icon && (
                    <img
                      src={tab.icon}
                      alt={tab.name}
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                    />
                  )}
                  {tab.image && (
                    <img
                      src={tab.image}
                      alt={tab.name}
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                    />
                  )}
                  {!tab.icon && !tab.image && (
                    <div className="w-4 h-4 rounded-sm bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs flex-shrink-0">
                      {tab.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[140px] truncate">
                    {tab.headerName}
                  </span>
                  <button
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    className={`ml-1 p-1 rounded transition-colors flex-shrink-0 ${
                      isActive
                        ? "hover:bg-gray-200 dark:hover:bg-gray-700"
                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    aria-label="Close tab"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            <button
              onClick={handleAddTab}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex-shrink-0 ml-1"
              aria-label="Add new survey"
              title="Add new survey"
            >
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {tabs.length > 1 && (
            <button
              onClick={handleCloseAllTabs}
              className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex-shrink-0"
              title="Close all tabs"
            >
              Close all
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Header;
