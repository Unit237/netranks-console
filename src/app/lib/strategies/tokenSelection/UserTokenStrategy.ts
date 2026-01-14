import token from "../../../utils/token";
import type { TokenSelectionStrategy } from "./TokenSelectionStrategy";

/**
 * Strategy for endpoints that require user token only (no fallback to visitor).
 * These endpoints are for authenticated user sessions.
 */
export class UserTokenStrategy implements TokenSelectionStrategy {
  /**
   * Endpoint patterns that require user token.
   * Must match exactly with the original implementation.
   */
  private readonly userEndpointPatterns = [
    "ChangeSurveySchedule",
    "CreateSurvey",
    "UpdateUser",
    "DeleteMember",
    "AddMember",
    "UpdateMember",
    "GetMembers",
    "GetPendingInvitations",
    "DeleteInvitation",
    "AddQuestion",
    "EditQuestion",
    "DeleteQuestion",
  ];

  /**
   * Checks if the URL matches user endpoint patterns.
   */
  matches(url: string): boolean {
    return this.userEndpointPatterns.some((pattern) =>
      url.includes(pattern)
    );
  }

  /**
   * Selects user token for user-only endpoints.
   * Returns null if token is unavailable.
   * Logs warning in DEV mode if token is required but not found.
   */
  selectToken(url: string): string | null {
    const userToken = token.getUser();
    
    if (!userToken && import.meta.env.DEV) {
      console.warn(
        `[API] User token required for ${url} but not found. User may need to log in.`
      );
    }

    return userToken;
  }
}

