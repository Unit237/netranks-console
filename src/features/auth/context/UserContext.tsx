import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { DUMMY_USER } from "../../../app/utils/constant";
import { debugLog, debugError } from "../../../app/utils/debugLogger";
import Hub, { HubType, useHub } from "../../../app/utils/Hub";
import token from "../../../app/utils/token";
import type { UserData } from "../@types";
import { getUser } from "../services/authService";

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  useActiveProjectId: () => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();
  const isConsoleRoute = location.pathname.startsWith("/console");
  
  // Debug: Log pathname changes
  // Listen for token changes (e.g., after magic link authentication)
  const [tokenValue, setTokenValue] = useState<string | null>(token.get());
  useHub(HubType.AuthTokenChanged, (newToken: string | null) => {
    debugLog("UserContext", "Token changed", { hasToken: !!newToken });
    setTokenValue(newToken);
    
    // If token was just set and we're on console route, fetch user data
    if (newToken && isConsoleRoute && !user && !loading) {
      debugLog("UserContext", "Token set on console route - fetching user data");
      refreshUser().catch((err) => {
        debugError("UserContext", "refreshUser promise rejected", err);
      });
    }
  });

  useEffect(() => {
    debugLog("UserContext", "Location changed", {
      pathname: location.pathname,
      isConsoleRoute,
      search: location.search,
      hash: location.hash
    });
  }, [location.pathname, location.search, location.hash, isConsoleRoute]);

  const refreshUser = useCallback(async () => {
    try {
      debugLog("UserContext", "Starting refreshUser");
      setLoading(true);
      setError(null);
      const userData = await getUser();
      debugLog("UserContext", "getUser() completed", { 
        hasData: !!userData,
        dataType: typeof userData,
        isObject: typeof userData === "object",
        hasProjects: !!(userData as any)?.Projects,
        projectsIsArray: Array.isArray((userData as any)?.Projects)
      });
      
      if (userData && typeof userData === "object") {
        // Ensure Projects is always an array
        if (!userData.Projects || !Array.isArray(userData.Projects)) {
          debugLog("UserContext", "Projects is not array, converting", { 
            projects: userData.Projects 
          });
          userData.Projects = [];
        }
        setUser(userData);
        debugLog("UserContext", "User set successfully", { 
          userId: userData.Id,
          projectsCount: userData.Projects.length 
        });
      } else {
        debugError("UserContext", "Invalid user data received", userData);
        if (import.meta.env.DEV) {
          console.warn("Invalid user data received, using null");
        }
        setUser(null);
        setError(new Error("Invalid user data received from server"));
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch user");
      debugError("UserContext", "Failed to fetch user", err);
      console.error("Failed to fetch user:", error);
      setError(error);
      setUser(null);
      // Don't throw error here - let components handle null user gracefully
    } finally {
      setLoading(false);
      debugLog("UserContext", "refreshUser completed", { 
        loading: false,
        hasUser: !!user,
        hasError: !!error
      });
    }
  }, []);

  useEffect(() => {
    debugLog("UserContext", "useEffect triggered", { 
      pathname: location.pathname,
      isConsoleRoute,
      loading,
      hasUser: !!user,
      hasError: !!error
    });
    
    const pathname = location.pathname;
    
    // Routes that should NOT clear user data (auth routes, magic links, etc.)
    const authRoutes = [
      "/signin",
      "/magic-link-sent",
      "/login"
    ];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    // Magic link pattern: /number/string/string (e.g., /593/JDy1Y1/Fx4jl1)
    // Also check for /login/number/string/string pattern
    const isMagicLinkRoute = /^\/\d+\/[^/]+\/[^/]+$/.test(pathname) || 
                            /^\/login\/\d+\/[^/]+\/[^/]+$/.test(pathname);
    
    // Fetch user data when on console route OR when we have a token but user is null
    // This ensures we fetch user data after magic link authentication
    const hasToken = token.get();
    
    if (isConsoleRoute) {
      debugLog("UserContext", "On console route - calling refreshUser");
      refreshUser().catch((err) => {
        debugError("UserContext", "refreshUser promise rejected", err);
        // Error is handled in refreshUser
      });
    } else if (hasToken && !user && !loading) {
      // We have a token but no user data - fetch it (e.g., after magic link auth)
      // BUT: Don't fetch on magic link routes - wait for magic link handler to consume the link first
      // The magic link handler will set the token, then we can fetch user data
      if (pathname !== "/signin" && pathname !== "/magic-link-sent" && !isMagicLinkRoute) {
        debugLog("UserContext", "Has token but no user - fetching user data", {
          pathname,
          hasToken: !!hasToken,
          isMagicLinkRoute,
          isAuthRoute
        });
        refreshUser().catch((err) => {
          debugError("UserContext", "refreshUser promise rejected", err);
        });
      } else {
        debugLog("UserContext", "Skipping fetch (on signin/auth/magic-link page)", {
          pathname,
          isMagicLinkRoute,
          isAuthRoute
        });
      }
    } else {
      // Only clear user data if we're explicitly on a non-console, non-auth route
      // Don't clear on:
      // - Initial mount (pathname is "/" or empty)
      // - Auth routes (signin, magic-link-sent, login routes)
      // - Magic link routes (pattern: /number/string/string)
      // - Brand-rank or dashboard routes
      const shouldClear = pathname && 
                         pathname !== "/" && 
                         !pathname.startsWith("/console") &&
                         !isAuthRoute &&
                         !isMagicLinkRoute &&
                         !pathname.startsWith("/brand-rank") &&
                         !pathname.startsWith("/dashboard");
      
      if (shouldClear) {
        debugLog("UserContext", "Clearing user data (navigated away from console/auth)", {
          pathname: pathname
        });
        setUser(null);
        setError(null);
        setLoading(false);
      } else {
        debugLog("UserContext", "Skipping clear (auth route, magic link, or initial mount)", {
          pathname: pathname || "undefined",
          isAuthRoute,
          isMagicLinkRoute,
          hasToken: !!hasToken,
          hasUser: !!user
        });
      }
    }
  }, [isConsoleRoute, refreshUser, location.pathname]);

  const useActiveProjectId = () => {
    if (user && user.Projects && user.Projects.length > 0) {
      const activeProject = user.Projects.find((p) => p.IsActive);

      return activeProject?.Id || user.Projects[0].Id;
    }
    return 0;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        refreshUser,
        useActiveProjectId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
