import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    // Skip authentication check for dashboard route
    if (isDashboardRoute) {
      return;
    }

    const authToken = token.get();

    if (!authToken) {
      console.log("no token");
      navigate("/signin", { replace: true });
      return;
    }

    // Track when loading starts (API call initiated)
    if (loading) {
      hasStartedLoading.current = true;
      hasLoggedAuthStatus.current = false;
      return;
    }

    if (hasStartedLoading.current && !hasLoggedAuthStatus.current) {
      hasLoggedAuthStatus.current = true;

      // Only log if API call completed and user is not authenticated
      if (error || !user) {
        console.log("user not logged in");
        navigate("/signin", { replace: true });
      }
    }
  }, [user, loading, error, navigate, isDashboardRoute]);

  // Allow dashboard route without authentication
  if (isDashboardRoute) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
