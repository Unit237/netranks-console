export function toPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }

  return `${(value * 100).toFixed(0)}%`;
}
