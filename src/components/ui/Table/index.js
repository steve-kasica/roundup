export { default as StyledAlternatingTableRow } from "./StyledAlternatingTableRow.jsx";
export { default as StyledTableCell } from "./StyledTableCell.jsx";
export { default as StickyTableCell } from "./StickyTableCell.jsx";

// Placeholder counts for tables with no data
// I chose 10 and 30 as a reasonable default to give users a sense of table structure
// I also moved this constant here to avoid circular dependencies
// and also to avoid passing constant props through multiple component, aka
// prop-drilling, which is extremely useful when debugging components
// that exhibit unnecessary re-renders due to changing props.
export const PLACEHOLDER_COLUMN_COUNT = 10;
export const PLACEHOLDER_ROW_COUNT = 30;
export const MAX_COLUMN_WIDTH = 20;
