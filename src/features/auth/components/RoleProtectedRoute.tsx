import { useEffect, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { canCreateSurveys, canViewBilling } from "../../../app/utils/userRole";
import { useUser } from "../context/UserContext";

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredPermission: "createSurveys" | "viewBilling";
  redirectTo?: string;
}

/**
 * Route guard that checks user role permissions
 * Redirects to console if user doesn't have required permission
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredPermission,
  redirectTo = "/console",
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const params = useParams<{ projectId?: string }>();

  useEffect(() => {
    if (!user) {
      return; // Let ProtectedRoute handle authentication
    }

    // Get project ID from params or active project
    const projectId = params.projectId
      ? parseInt(params.projectId, 10)
      : user.Projects?.find((p) => p.IsActive)?.Id || user.Projects?.[0]?.Id;

    let hasPermission = false;

    if (requiredPermission === "createSurveys") {
      hasPermission = canCreateSurveys(user, projectId);
    } else if (requiredPermission === "viewBilling") {
      hasPermission = canViewBilling(user, projectId);
    }

    if (!hasPermission) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, params.projectId, requiredPermission, navigate, redirectTo]);

  if (!user) {
    return null; // Let ProtectedRoute handle authentication
  }

  // Get project ID from params or active project
  const projectId = params.projectId
    ? parseInt(params.projectId, 10)
    : user.Projects?.find((p) => p.IsActive)?.Id || user.Projects?.[0]?.Id;

  let hasPermission = false;

  if (requiredPermission === "createSurveys") {
    hasPermission = canCreateSurveys(user, projectId);
  } else if (requiredPermission === "viewBilling") {
    hasPermission = canViewBilling(user, projectId);
  }

  if (!hasPermission) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};
