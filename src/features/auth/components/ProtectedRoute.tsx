import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { debugLog } from "../../../app/utils/debugLogger";
import token from "../../../app/utils/token";
import { useUser } from "../context/UserContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useUser();
  const hasStartedLoading = useRef(false);
  const hasLoggedAuthStatus = useRef(false);

  // Allow dashboard route without authentication
  const isDashboardRoute = location.pathname.startsWith("/console/dashboard/");

  useEffect(() => {
    debugLog("ProtectedRoute", "useEffect triggered", {
      pathname: location.pathname,
      isDashboardRoute,
      loading,
      hasUser: !!user,
      hasError: !!error,
      errorMessage: error?.message
    });

    // Skip authentication check for dashboard route
    if (isDashboardRoute) {
      debugLog("ProtectedRoute", "Skipping auth check (dashboard route)");
      return;
    }

    const authToken = token.getUser();

    if (!authToken) {
      debugLog("ProtectedRoute", "No token found, redirecting to signin");
      navigate("/signin", { replace: true });
      return;
    }

    // Track when loading starts (API call initiated)
    if (loading) {
      debugLog("ProtectedRoute", "Loading in progress");
      hasStartedLoading.current = true;
      hasLoggedAuthStatus.current = false;
      return;
    }

    if (hasStartedLoading.current && !hasLoggedAuthStatus.current) {
      hasLoggedAuthStatus.current = true;

      // Only log if API call completed and user is not authenticated
      if (error || !user) {
        debugLog("ProtectedRoute", "User not authenticated, redirecting", {
          hasError: !!error,
          hasUser: !!user
        });
        navigate("/signin", { replace: true });
      } else {
        debugLog("ProtectedRoute", "User authenticated successfully");
      }
    }
  }, [user, loading, error, navigate, isDashboardRoute, location.pathname]);

  // Allow dashboard route without authentication
  if (isDashboardRoute) {
    debugLog("ProtectedRoute", "Rendering children (dashboard route)");
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (loading || !user) {
    debugLog("ProtectedRoute", "Showing loading state", { loading, hasUser: !!user });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  debugLog("ProtectedRoute", "Rendering protected children");
  return <>{children}</>;
};

export default ProtectedRoute;
