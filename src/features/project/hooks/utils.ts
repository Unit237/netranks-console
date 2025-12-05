const rows = [
  { period: 24 * 0, name: "One Time", cost: 0 },
  { period: 24 * 7, name: "Weekly", cost: 200, default: true },
  { period: 24 * 1, name: "Daily", cost: 1200 },
];

export function getPlanByPeriod(period: number) {
  return rows.find((item) => item.period === period);
}
