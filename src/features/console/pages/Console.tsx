import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ErrorBoundary from "../../../app/components/ErrorBoundary";
import AppLogo from "../../../app/shared/ui/AppLogo";
import { useUser } from "../../auth/context/UserContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useTabs } from "../context/TabContext";

const Console = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tabs, activeTabId, setActiveTab, addTab } = useTabs();
  const { useActiveProjectId } = useUser();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      // Use 768px breakpoint - standard mobile breakpoint
      // Also check for touch device to better detect actual mobile devices
      const isMobileWidth = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileWidth && isTouchDevice);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

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

  // Show mobile message if on mobile device
  if (isMobile) {
    return (
      <div className="relative flex h-screen items-center justify-center bg-white dark:bg-gray-900 p-4">
        {/* Logo in upper left */}
        <div className="absolute top-4 left-4">
          <AppLogo />
        </div>
        
        <div className="text-center max-w-md px-4 sm:px-6">
          <p className="text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100">
            This console is designed for desktop use. Please visit from a computer browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
