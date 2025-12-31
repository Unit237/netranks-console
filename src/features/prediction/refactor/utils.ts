// Utility functions for Brand prediction component

/**
 * Helper function to extract text from an item (string or object)
 * Tries multiple common property names to find text content
 */
export const extractTextFromItem = (item: any): string => {
  if (typeof item === "string") {
    return item;
  }
  if (typeof item === "object" && item !== null) {
    // Try common property names first
    if (item.text) return item.text;
    if (item.message) return item.message;
    if (item.suggestion) return item.suggestion;
    if (item.value) return item.value;
    if (item.content) return item.content;
    if (item.description) return item.description;
    if (item.title) return item.title;

    // Try to find any string property
    for (const key in item) {
      if (typeof item[key] === "string" && item[key]) {
        return item[key];
      }
    }

    // Last resort: format as readable string
    return JSON.stringify(item, null, 2);
  }
  return String(item || "");
};
