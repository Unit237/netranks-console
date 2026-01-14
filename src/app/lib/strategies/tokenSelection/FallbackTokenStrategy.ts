import token from "../../../utils/token";
import type { TokenSelectionStrategy } from "./TokenSelectionStrategy";

/**
 * Default strategy for endpoints that can use either user or visitor token.
 * Prefers user token, falls back to visitor token if user token is unavailable.
 */
export class FallbackTokenStrategy implements TokenSelectionStrategy {
  /**
   * Always matches (this is the default/catch-all strategy).
   */
  matches(_url: string): boolean {
    return true;
  }

  /**
   * Selects token with fallback logic: prefer user token, fallback to visitor.
   * This is the default strategy for endpoints not matching other patterns.
   */
  selectToken(_url: string): string | null {
    return token.getUser() || token.getVisitor();
  }
}

