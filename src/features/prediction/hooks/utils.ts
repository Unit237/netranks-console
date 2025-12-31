// NOTE: Currently unused. Only used by ShapSection.tsx, which is also unused.
// Utility functions for prediction feature components

/**
 * Formats a number to a fixed decimal places string, or returns "N/A" if the value is null/undefined
 * @param n - The number to format (can be number, null, or undefined)
 * @param digits - Number of decimal places (default: 2)
 * @returns Formatted number string or "N/A" if value is null/undefined
 */
export const formatNumberOrNA = (
  n: number | null | undefined,
  digits: number = 2
): string => {
  if (typeof n === "number") {
    return n.toFixed(digits);
  }
  return "N/A";
};
