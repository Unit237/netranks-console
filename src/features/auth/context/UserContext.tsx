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

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getUser();
      if (userData) {
        setUser(userData);
      } else {
        setUser(DUMMY_USER);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch user");
      console.error("Failed to fetch user:", error);
      setError(error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch user data when on console route and token exists
    if (isConsoleRoute) {
      refreshUser().catch(() => {
        // Error is handled in refreshUser
      });
    } else if (!isConsoleRoute) {
      // Clear user data when leaving console
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, [isConsoleRoute, refreshUser]);

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
