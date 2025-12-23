import {
  BarChart,
  Database,
  FileText,
  Home,
  Menu,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

// Types
interface Tab {
  id: string;
  title: string;
  component: ReactNode;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (id: string, title: string, component: ReactNode) => void;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hasTab: boolean;
}

interface TabProviderProps {
  children: ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tab Manager Context
const TabContext = createContext<TabContextType | null>(null);

// Hook to access tab manager
const useTabs = (): TabContextType => {
  const context = useContext(TabContext);
  if (!context) throw new Error("useTabs must be used within TabProvider");
  return context;
};

// Tab Manager Provider
const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = useCallback(
    (id: string, title: string, component: ReactNode) => {
      setTabs((prev) => {
        const exists = prev.find((t) => t.id === id);
        if (exists) {
          setActiveTabId(id);
          return prev;
        }
        const newTab: Tab = { id, title, component };
        setActiveTabId(id);
        return [...prev, newTab];
      });
    },
    []
  );

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        if (activeTabId === id && filtered.length > 0) {
          setActiveTabId(filtered[filtered.length - 1].id);
        }
        return filtered;
      });
    },
    [activeTabId]
  );

  const switchTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  return (
    <TabContext.Provider
      value={{ tabs, activeTabId, openTab, closeTab, switchTab }}
    >
      {children}
    </TabContext.Provider>
  );
};

// Example Components (these stay mounted)
const DashboardContent: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p className="text-gray-600 mb-4">
        This component opens as a tab and stays mounted
      </p>
      <button
        onClick={() => setCount(count + 1)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Counter: {count}
      </button>
      <p className="text-sm text-gray-500 mt-2">
        Switch tabs and come back - state persists!
      </p>
    </div>
  );
};

const AnalyticsContent: React.FC = () => {
  const [data, setData] = useState<string>("Initial data");
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <input
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-2"
        placeholder="Type something..."
      />
      <p className="text-sm text-gray-500">
        Your input persists across tab switches!
      </p>
    </div>
  );
};

const ReportsContent: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Reports</h2>
    <p className="text-gray-600">Reports content with tab support</p>
  </div>
);

const DataContent: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Data Management</h2>
    <p className="text-gray-600">Data management content with tab support</p>
  </div>
);

// Non-tab content (renders directly in main area)
const HomeContent: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Home</h2>
    <p className="text-gray-600 mb-4">
      This page does NOT open a tab - it renders directly
    </p>
    <p className="text-sm text-gray-500">
      Use the sidebar to navigate to tabbed pages
    </p>
  </div>
);

const SettingsContent: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Settings</h2>
    <p className="text-gray-600">Settings page without tab support</p>
  </div>
);

// Sidebar with navigation
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { openTab } = useTabs();
  const [currentView, setCurrentView] = useState<string>("home");

  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: Home, hasTab: false },
    { id: "settings", label: "Settings", icon: Settings, hasTab: false },
    { id: "dashboard", label: "Dashboard", icon: BarChart, hasTab: true },
    { id: "analytics", label: "Analytics", icon: FileText, hasTab: true },
    { id: "reports", label: "Reports", icon: FileText, hasTab: true },
    { id: "data", label: "Data", icon: Database, hasTab: true },
  ];

  const handleNavClick = (item: NavItem): void => {
    if (item.hasTab) {
      const components: Record<string, ReactNode> = {
        dashboard: <DashboardContent />,
        analytics: <AnalyticsContent />,
        reports: <ReportsContent />,
        data: <DataContent />,
      };
      openTab(item.id, item.label, components[item.id]);
    } else {
      // For non-tab items, dispatch custom event to update content area
      window.dispatchEvent(
        new CustomEvent("navigate-view", { detail: item.id })
      );
    }
    setCurrentView(item.id);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform lg:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold">App Name</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.hasTab && (
                  <span className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded">
                    Tab
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

// Tab Bar
const TabBar: React.FC = () => {
  const { tabs, activeTabId, switchTab, closeTab } = useTabs();

  if (tabs.length === 0) return null;

  return (
    <div className="bg-gray-100 border-b border-gray-300 flex items-center overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => switchTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 border-r border-gray-300 cursor-pointer min-w-max ${
            activeTabId === tab.id ? "bg-white" : "bg-gray-200 hover:bg-gray-50"
          }`}
        >
          <span className="text-sm">{tab.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Main Content Area
const ContentArea: React.FC = () => {
  const { tabs, activeTabId } = useTabs();
  const [currentView, setCurrentView] = useState<string>("home");

  // Expose setCurrentView to parent via context
  React.useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      setCurrentView(e.detail);
    };
    window.addEventListener("navigate-view", handleNavigation as EventListener);
    return () =>
      window.removeEventListener(
        "navigate-view",
        handleNavigation as EventListener
      );
  }, []);

  const showNonTabContent = tabs.length === 0 || !activeTabId;

  return (
    <div className="flex-1 overflow-auto bg-white">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          style={{ display: activeTabId === tab.id ? "block" : "none" }}
        >
          {tab.component}
        </div>
      ))}
      {showNonTabContent && (
        <div>
          {currentView === "home" && <HomeContent />}
          {currentView === "settings" && <SettingsContent />}
        </div>
      )}
    </div>
  );
};
// Main App
const TabTest: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <TabProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-300 px-4 py-3 flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold">Chrome-Style Tabs Demo</h2>
          </header>

          <TabBar />
          <ContentArea />
        </div>
      </div>
    </TabProvider>
  );
};

export default TabTest;
