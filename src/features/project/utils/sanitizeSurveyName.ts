/**
 * Sanitizes survey name by removing unwanted patterns and HTML entities
 * @param name - The survey name to sanitize
 * @returns Cleaned survey name
 */
export const sanitizeSurveyName = (name: string | null | undefined): string => {
  if (!name) return "";

  let cleaned = name;

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

  // If the text looks like a description (starts with a brand name followed by "is an", "is a", etc.)
  // Extract just the brand name (first word or first few words before "is")
  const descriptionPattern = /^([A-Za-z0-9][A-Za-z0-9\s.-]{0,50}?)\s+is\s+(an|a|the)\s+/i;
  const match = cleaned.match(descriptionPattern);
  if (match && match[1]) {
    // If it's a long description (over 80 chars) and matches the pattern, extract brand name
    if (cleaned.length > 80) {
      cleaned = match[1].trim();
    }
  }

  // Final cleanup
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned || name; // Return original if cleaning removed everything
};

