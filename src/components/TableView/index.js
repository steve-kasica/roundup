import TableView from "./TableView";
export { default as RawTableRows } from "./RawTableRows";
export { TableLabel } from "./TableLabel";
export { TableSummary } from "./TableSummary";

export const COLUMN_WIDTHS = {
  index: 10, // Row number column
  default: 100, // Default column width
  // You could add specific widths for certain column types
};

export default TableView;
