import token from "../../../utils/token";
import type { TokenSelectionStrategy } from "./TokenSelectionStrategy";

/**
 * Strategy for endpoints that require visitor token only.
 * These endpoints are for anonymous/visitor sessions.
 */
export class VisitorTokenStrategy implements TokenSelectionStrategy {
  /**
   * Endpoint patterns that require visitor token.
   * Must match exactly with the original implementation.
   */
  private readonly visitorEndpointPatterns = [
    "CreateSurveyFromQuery",
    "CreateSurveyFromBrand",
    "StartSurvey",
    "GenerateQuestionsFromQuery",
    "GenerateQuestionsFromBrand",
  ];

  /**
   * Checks if the URL matches visitor endpoint patterns.
   */
  matches(url: string): boolean {
    return this.visitorEndpointPatterns.some((pattern) =>
      url.includes(pattern)
    );
  }

  /**
   * Selects visitor token for visitor endpoints.
   * Returns null if token is unavailable.
   */
  selectToken(_url: string): string | null {
    return token.getVisitor();
  }
}

