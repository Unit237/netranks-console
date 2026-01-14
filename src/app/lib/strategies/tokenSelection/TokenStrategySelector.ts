import type { TokenSelectionStrategy } from "./TokenSelectionStrategy";
import { VisitorTokenStrategy } from "./VisitorTokenStrategy";
import { UserTokenStrategy } from "./UserTokenStrategy";
import { FallbackTokenStrategy } from "./FallbackTokenStrategy";

/**
 * Selects the appropriate token selection strategy based on URL patterns.
 * 
 * Priority order (matches original if/else logic):
 * 1. VisitorTokenStrategy (highest priority)
 * 2. UserTokenStrategy
 * 3. FallbackTokenStrategy (default)
 */
export class TokenStrategySelector {
  private readonly visitorStrategy: VisitorTokenStrategy;
  private readonly userStrategy: UserTokenStrategy;
  private readonly fallbackStrategy: FallbackTokenStrategy;

  constructor() {
    this.visitorStrategy = new VisitorTokenStrategy();
    this.userStrategy = new UserTokenStrategy();
    this.fallbackStrategy = new FallbackTokenStrategy();
  }

  /**
   * Selects the appropriate strategy for the given URL.
   * Matches the exact priority order of the original if/else implementation.
   */
  selectStrategy(url: string): TokenSelectionStrategy {
    // Check visitor endpoints first (highest priority)
    // This matches: if (isVisitorEndpoint) { ... }
    if (this.visitorStrategy.matches(url)) {
      return this.visitorStrategy;
    }

    // Check user endpoints second
    // This matches: else if (requiresUserToken) { ... }
    if (this.userStrategy.matches(url)) {
      return this.userStrategy;
    }

    // Default to fallback strategy
    // This matches: else { ... }
    return this.fallbackStrategy;
  }

  /**
   * Convenience method to select token directly.
   * This is what the interceptor will use.
   */
  selectToken(url: string): string | null {
    const strategy = this.selectStrategy(url);
    return strategy.selectToken(url);
  }
}

