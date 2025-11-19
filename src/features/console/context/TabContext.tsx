import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Tab {
  id: string;
  name: string;
  path: string;
  icon?: string;
  image?: string;
  isProject?: boolean;
  projectId?: number;
  headerName: string;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, "id">) => string;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTabName: (tabId: string, name: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

const STORAGE_KEY = "console_tabs";
const ACTIVE_TAB_KEY = "console_active_tab";

export const TabProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeTabId, setActiveTabIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_TAB_KEY);
    } catch {
      return null;
    }
  });

  // Persist tabs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch (error) {
      console.error("Failed to save tabs to localStorage:", error);
    }
  }, [tabs]);

  // Persist active tab to localStorage
  useEffect(() => {
    try {
      if (activeTabId) {
        localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
      } else {
        localStorage.removeItem(ACTIVE_TAB_KEY);
      }
    } catch (error) {
      console.error("Failed to save active tab to localStorage:", error);
    }
  }, [activeTabId]);

  const addTab = useCallback((tab: Omit<Tab, "id">): string => {
    let tabId: string;

    setTabs((prev) => {
      // Check if tab with same path already exists
      const existingTab = prev.find((t) => t.path === tab.path);
      if (existingTab) {
        tabId = existingTab.id;
        setActiveTabIdState(existingTab.id);
        return prev;
      }

      const newTab: Tab = {
        ...tab,
        id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      tabId = newTab.id;
      setActiveTabIdState(newTab.id);
      return [...prev, newTab];
    });

    return tabId!;
  }, []);

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== tabId);

        // If closing active tab, switch to another tab
        if (activeTabId === tabId) {
          if (newTabs.length > 0) {
            const currentIndex = prev.findIndex((t) => t.id === tabId);
            const newActiveIndex = Math.min(currentIndex, newTabs.length - 1);
            setActiveTabIdState(newTabs[newActiveIndex]?.id || null);
          } else {
            setActiveTabIdState(null);
          }
        }

        return newTabs;
      });
    },
    [activeTabId]
  );

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabIdState(null);
  }, []);

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabIdState(tabId);
  }, []);

  const updateTabName = useCallback((tabId: string, name: string) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, name } : t)));
  }, []);

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        closeTab,
        closeAllTabs,
        setActiveTab,
        updateTabName,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTabs must be used within a TabProvider");
  }
  return context;
};
