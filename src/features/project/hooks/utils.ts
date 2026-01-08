const rows = [
  { period: 24 * 0, name: "One Time", cost: 0 },
  { period: 24 * 7, name: "Weekly", cost: 200, default: true },
  { period: 24 * 1, name: "Daily", cost: 1200 },
];

export function getPlanByPeriod(period: number) {
  return rows.find((item) => item.period === period);
}

export function getInitials(text: string): string {
  if (!text) return "";

  // Remove anything inside parentheses + the parentheses themselves
  const cleaned = text.replace(/\([^)]*\)/g, "").trim();

  if (!cleaned) return "";

  const words = cleaned.split(/\s+/); // split by spaces
  const firstTwo = words.slice(0, 2);

  return firstTwo.map((word) => word[0]?.toUpperCase() || "").join("");
}

export function toPercentage(value: number, decimals: number = 0): string {
  if (isNaN(value)) return "0%";

  return (value * 100).toFixed(decimals) + "%";
}
