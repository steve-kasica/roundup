/**
 * All column properties available from `withColumnData`, grouped by category.
 * Each entry maps to a prop passed by the HOC.
 */
export const COLUMN_PROPERTIES = [
  { key: "name", label: "Name", group: "Identity" },
  { key: "parentName", label: "Parent", group: "Identity" },
  { key: "columnType", label: "Type", group: "Identity" },
  { key: "index", label: "Index", group: "Identity" },
  { key: "count", label: "Count", group: "Statistics" },
  { key: "approxUnique", label: "Approx. Unique", group: "Statistics" },
  { key: "duplicateCount", label: "Duplicate Count", group: "Statistics" },
  { key: "uniquePercentage", label: "Unique %", group: "Statistics" },
  { key: "nullCount", label: "Null Count", group: "Statistics" },
  { key: "nullPercentage", label: "Null %", group: "Statistics" },
  { key: "completePercentage", label: "Complete %", group: "Statistics" },
  { key: "nonNullCount", label: "Non-Null Count", group: "Statistics" },
  { key: "modeValue", label: "Mode Value", group: "Statistics" },
  { key: "modeCount", label: "Mode Count", group: "Statistics" },
  { key: "avg", label: "Average", group: "Numerical" },
  { key: "min", label: "Min", group: "Numerical" },
  { key: "max", label: "Max", group: "Numerical" },
  { key: "std", label: "Std Dev", group: "Numerical" },
  { key: "p25", label: "25th Percentile", group: "Numerical" },
  { key: "p50", label: "Median (P50)", group: "Numerical" },
  { key: "p75", label: "75th Percentile", group: "Numerical" },
];

export const DEFAULT_VISIBLE = new Set(["name", "parentName", "columnType"]);
