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
  replaceTab: (currentTabId: string | null, newTab: Omit<Tab, "id">) => string;
  navigateToTab: (path: string, tabName?: string) => void;
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

  const replaceTab = useCallback(
    (currentTabId: string | null, newTab: Omit<Tab, "id">): string => {
      let newTabId: string;

      // Check if tab with same path already exists
      setTabs((prev) => {
        const existingTab = prev.find((t) => t.path === newTab.path);
        if (existingTab) {
          newTabId = existingTab.id;
          // If replacing current tab, close it first
          if (currentTabId && currentTabId !== existingTab.id) {
            return prev.filter((t) => t.id !== currentTabId);
          }
          return prev;
        }

        // Create new tab
        const tab: Tab = {
          ...newTab,
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        newTabId = tab.id;

        // If replacing current tab, remove it and add new one
        if (currentTabId) {
          return prev.filter((t) => t.id !== currentTabId).concat(tab);
        }

        // Otherwise just add new tab
        return [...prev, tab];
      });

      // Set active tab after state update to avoid infinite loops
      setActiveTabIdState(newTabId!);

      return newTabId!;
    },
    []
  );

  const navigateToTab = useCallback((path: string, tabName?: string) => {
    let tabId: string | null = null;

    setTabs((prev) => {
      const existingTab = prev.find((t) => t.path === path);
      if (existingTab) {
        tabId = existingTab.id;
        return prev;
      }

      // Create new tab if it doesn't exist
      const name = tabName || path.split("/").pop() || "New Tab";
      const newTab: Tab = {
        name,
        path,
        headerName: name,
        id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      tabId = newTab.id;
      return [...prev, newTab];
    });

    // Set active tab after state update to avoid infinite loops
    if (tabId) {
      setActiveTabIdState(tabId);
    }
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
        replaceTab,
        navigateToTab,
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
