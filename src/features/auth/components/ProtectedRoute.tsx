import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import token from "../../../app/utils/token";
import { useUser } from "../context/UserContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, loading, error } = useUser();
  const hasStartedLoading = useRef(false);
  const hasLoggedAuthStatus = useRef(false);

  useEffect(() => {
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
  }, [user, loading, error, navigate]);

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
