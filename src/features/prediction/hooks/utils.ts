type Nullable<T> = T | null | undefined;

export const formatNumberOrNA = (n: Nullable<number>, digits = 2) =>
  typeof n === "number" ? n.toFixed(digits) : "N/A";
