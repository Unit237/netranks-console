import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import token from "../../../app/utils/token";
import { useUser } from "../context/UserContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, loading, error } = useUser();

  console.log(token.get());
  console.log(user);

  useEffect(() => {
    const authToken = token.get();

    // If no token, redirect to signin immediately
    if (!authToken) {
      navigate("/signin", { replace: true });
      return;
    }

    // If user fetch completed but failed or no user data, redirect to signin
    if (!loading) {
      if (error || !user) {
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
