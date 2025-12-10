/**
 * Calculates LastRunAt from NextRunAt and SchedulePeriodHours
 * Formula: LastRunAt = NextRunAt - SchedulePeriodHours
 * 
 * @param nextRunAt - ISO date string when survey will run next (or null/undefined)
 * @param schedulePeriodHours - Hours between runs (0 means paused)
 * @returns ISO date string of when survey last ran, or null if never ran
 */
export const calculateLastRunAt = (
  nextRunAt: string | null | undefined,
  schedulePeriodHours: number
): string | null => {
  // If no NextRunAt, survey never ran
  if (!nextRunAt) {
    return null;
  }

  // If paused (SchedulePeriodHours === 0), can't calculate LastRunAt
  if (schedulePeriodHours === 0) {
    return null;
  }

  try {
    const nextRunDate = new Date(nextRunAt);
    
    // Check if date is valid
    if (isNaN(nextRunDate.getTime())) {
      return null;
    }

    // Calculate LastRunAt by subtracting SchedulePeriodHours
    const lastRunDate = new Date(nextRunDate.getTime() - schedulePeriodHours * 60 * 60 * 1000);
    
    return lastRunDate.toISOString();
  } catch {
    return null;
  }
};

