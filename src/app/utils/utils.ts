export function toPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }

  return `${(value * 100).toFixed(0)}%`;
}

export function truncate(str?: string, maxLength: number = 23): string {
  if (!str) return "";
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}

export function cleanDescription(text: string | null | undefined): string {
  if (!text) return "";

  let cleaned = text;

  // Remove Unicode private use area characters
  cleaned = cleaned.replace(/[\uE000-\uF8FF]/g, "");

  // Remove HTML entities (common ones)
  cleaned = cleaned
    .replace(/&cite;/gi, "")
    .replace(/&turn;/gi, "")
    .replace(/&view;/gi, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Remove patterns like "cite turn0view0", "cite turn1search12" or similar unwanted text
  // Match various combinations with flexible spacing and number patterns
  cleaned = cleaned
    // Pattern: "cite turn0view0" or "cite turn 0 view 0" (with spaces)
    .replace(/\bcite\s*turn\s*\d*\s*view\s*\d*\b/gi, "")
    .replace(/\bcite\s*turn\d*view\d*\b/gi, "")
    // Pattern: "cite turn1search12" or "cite turn 1 search 12" (with "search" instead of "view")
    .replace(/\bcite\s*turn\s*\d*\s*search\s*\d*\b/gi, "")
    .replace(/\bcite\s*turn\d*search\d*\b/gi, "")
    // Pattern: "turn0view0" or "turn 0 view 0"
    .replace(/\bturn\s*\d*\s*view\s*\d*\b/gi, "")
    .replace(/\bturn\d*view\d*\b/gi, "")
    // Pattern: "turn1search12" or "turn 1 search 12"
    .replace(/\bturn\s*\d*\s*search\s*\d*\b/gi, "")
    .replace(/\bturn\d*search\d*\b/gi, "")
    // Pattern: "cite turn0" or "cite turn 0"
    .replace(/\bcite\s*turn\s*\d*\b/gi, "")
    .replace(/\bcite\s*turn\d*\b/gi, "")
    // Pattern: "cite view0" or "cite view 0"
    .replace(/\bcite\s*view\s*\d*\b/gi, "")
    .replace(/\bcite\s*view\d*\b/gi, "")
    // Pattern: "cite search0" or "cite search 0"
    .replace(/\bcite\s*search\s*\d*\b/gi, "")
    .replace(/\bcite\s*search\d*\b/gi, "")
    // More aggressive: remove standalone "cite", "turn0", "view0", "search0" patterns
    .replace(/\bcite\b/gi, "")
    .replace(/\bturn\s*\d+\b/gi, "")
    .replace(/\bview\s*\d+\b/gi, "")
    .replace(/\bsearch\s*\d+\b/gi, "")
    // Remove any sequence of "cite turn view" or "cite turn search" regardless of spacing/numbers
    .replace(/cite[\s]*turn[\s]*\d*[\s]*view[\s]*\d*/gi, "")
    .replace(/turn[\s]*\d*[\s]*view[\s]*\d*/gi, "")
    .replace(/cite[\s]*turn[\s]*\d*[\s]*search[\s]*\d*/gi, "")
    .replace(/turn[\s]*\d*[\s]*search[\s]*\d*/gi, "");
  
  // Remove "mentions" at the end (case insensitive)
  cleaned = cleaned.replace(/\s+mentions\s*$/gi, "");

  // Remove any remaining HTML entity patterns (&#number; or &entity;)
  cleaned = cleaned.replace(/&#?\w+;/g, "");

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Remove leading/trailing punctuation that might be left behind
  cleaned = cleaned.replace(/^[^\w]+|[^\w]+$/g, "").trim();

  return cleaned || text || ""; // Return original if cleaning removed everything
}
