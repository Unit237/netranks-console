import type { UserData } from "../../features/auth/@types";

export type UserRole = "Owner" | "Editor" | "Viewer";

/**
 * Gets the user's role for a specific project
 * @param user - The user data object
 * @param projectId - The project ID to check
 * @returns The user's role: "Owner", "Editor", or "Viewer"
 */
export function getUserRoleForProject(
  user: UserData | null,
  projectId: number | null | undefined
): UserRole {
  if (!user || !projectId) {
    return "Viewer";
  }

  const project = user.Projects?.find((p) => p.Id === projectId);

  if (!project) {
    return "Viewer";
  }

  if (project.IsOwner) {
    return "Owner";
  }

  if (project.IsEditor) {
    return "Editor";
  }

  return "Viewer";
}

/**
 * Gets the user's role for the active project
 * @param user - The user data object
 * @returns The user's role for the active project
 */
export function getUserRoleForActiveProject(
  user: UserData | null
): UserRole {
  if (!user?.Projects || user.Projects.length === 0) {
    return "Viewer";
  }

  const activeProject = user.Projects.find((p) => p.IsActive) || user.Projects[0];

  return getUserRoleForProject(user, activeProject?.Id);
}

/**
 * Checks if the user can manage members (only Owners)
 * @param user - The user data object
 * @param projectId - The project ID to check
 * @returns true if user is Owner
 */
export function canManageMembers(
  user: UserData | null,
  projectId: number | null | undefined
): boolean {
  return getUserRoleForProject(user, projectId) === "Owner";
}

/**
 * Checks if the user can create surveys (Owners and Editors)
 * @param user - The user data object
 * @param projectId - The project ID to check
 * @returns true if user is Owner or Editor
 */
export function canCreateSurveys(
  user: UserData | null,
  projectId: number | null | undefined
): boolean {
  const role = getUserRoleForProject(user, projectId);
  return role === "Owner" || role === "Editor";
}

/**
 * Checks if the user can view billing (only Owners)
 * @param user - The user data object
 * @param projectId - The project ID to check
 * @returns true if user is Owner
 */
export function canViewBilling(
  user: UserData | null,
  projectId: number | null | undefined
): boolean {
  return getUserRoleForProject(user, projectId) === "Owner";
}
