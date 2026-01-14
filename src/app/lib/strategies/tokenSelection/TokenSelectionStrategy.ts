/**
 * Strategy interface for selecting authentication tokens based on endpoint URL.
 */
export interface TokenSelectionStrategy {
  /**
   * Checks if this strategy matches the given URL.
   * @param url - The API endpoint URL
   * @returns true if this strategy should be used for this URL
   */
  matches(url: string): boolean;

  /**
   * Selects the appropriate authentication token for the given URL.
   * @param url - The API endpoint URL
   * @returns The selected token string, or null if no token should be used
   */
  selectToken(url: string): string | null;
}

