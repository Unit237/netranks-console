import React, { createContext, useContext, type ReactNode } from "react";
import { useParams as useRouterParams } from "react-router-dom";

interface TabRouteParamsContextType {
  params: Record<string, string>;
}

const TabRouteParamsContext = createContext<TabRouteParamsContextType | undefined>(undefined);

export const TabRouteParamsProvider: React.FC<{
  children: ReactNode;
  params: Record<string, string>;
}> = ({ children, params }) => {
  return (
    <TabRouteParamsContext.Provider value={{ params }}>
      {children}
    </TabRouteParamsContext.Provider>
  );
};

/**
 * Custom hook to get route params from tab context
 * This replaces useParams from react-router-dom for tab components
 */
export function useTabParams<T extends Record<string, string> = Record<string, string>>(): T {
  const context = useContext(TabRouteParamsContext);
  if (context === undefined) {
    // Fallback to empty object if not in tab context
    return {} as T;
  }
  return context.params as T;
}

/**
 * Enhanced useParams that works with both tab context and react-router
 * Components can use this instead of react-router's useParams
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const tabContext = useContext(TabRouteParamsContext);
  const routerParams = useRouterParams();

  // If we're in a tab context, use tab params (preferred for tab components)
  // Otherwise fall back to router params (for non-tab routes)
  if (tabContext) {
    return tabContext.params as T;
  }
  return routerParams as T;
}

