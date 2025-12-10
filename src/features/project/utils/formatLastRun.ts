/**
 * Formats LastRunAt date as a relative time string
 * @param lastRunAt - ISO date string or null/undefined
 * @returns Formatted string like "Just now", "5m ago", "2h ago", "3d ago", or formatted date
 */
export const formatLastRun = (lastRunAt: string | null | undefined): string => {
  if (!lastRunAt) return "Never";
  
  try {
    const date = new Date(lastRunAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For older dates, show formatted date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Invalid date";
  }
};

