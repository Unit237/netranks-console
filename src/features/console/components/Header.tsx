import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTabs } from "../context/TabContext";

const Header = () => {
  const { tabs, activeTabId, closeTab, closeAllTabs, setActiveTab, addTab } =
    useTabs();
  const navigate = useNavigate();

  const handleAddTab = () => {
    const tabId = addTab({
      name: "untitled survey",
      path: "/console/brand",
      headerName: "untitled survey",
    });
    navigate("/console/brand");
  };

  const handleTabClick = (tabId: string, path: string) => {
    setActiveTab(tabId);
    navigate(path);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);

    // If closing active tab, navigate to the new active tab or dashboard
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter((t) => t.id !== tabId);
      if (remainingTabs.length > 0) {
        const currentIndex = tabs.findIndex((t) => t.id === tabId);
        const newActiveIndex = Math.min(currentIndex, remainingTabs.length - 1);
        const newActiveTab = remainingTabs[newActiveIndex];
        navigate(newActiveTab.path);
      } else {
        navigate("/console/dashboard");
      }
    }
  };

  const handleCloseAllTabs = () => {
    closeAllTabs();
    // Don't navigate - let the empty state show
  };

  return (
    <div className="bg-gray-200 dark:bg-gray-900 flex items-center gap-2 pr-4 pt-2 overflow-x-auto">
      {tabs.length > 0 && (
        <>
          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {tab.icon && (
                    <img
                      src={tab.icon}
                      alt={tab.name}
                      className="w-4 h-4 rounded-sm"
                    />
                  )}
                  {tab.image && (
                    <img
                      src={tab.image}
                      alt={tab.name}
                      className="w-4 h-4 rounded-sm"
                    />
                  )}
                  {!tab.icon && !tab.image && (
                    <div className="w-4 h-4 rounded-sm bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                      {tab.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate">
                    {tab.headerName}
                  </span>
                  <button
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    aria-label="Close tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              );
            })}
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
      <button
        onClick={handleAddTab}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex-shrink-0"
        aria-label="Add new tab"
        title="Add new tab"
      >
        <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default Header;
