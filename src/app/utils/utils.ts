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
