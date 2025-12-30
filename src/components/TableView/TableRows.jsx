/**
 * @fileoverview TableRows Component
 *
 * A comprehensive data table component that renders table data with advanced features
 * including sorting, pagination, column hovering, and infinite scrolling. This component
 * displays tabular data in a Material-UI Table with enhanced user interactions.
 *
 * Key Features:
 * - Sortable columns with visual indicators (asc/desc/none cycling)
 * - Infinite scrolling with automatic pagination
 * - Column hover effects and highlighting
 * - Sticky row numbers for easy row identification
 * - Loading states and error handling
 * - Responsive column widths with text truncation
 * - Alternating row colors for better readability
 * - Sticky header that remains visible during scrolling
 * - Integration with DuckDB for data queries
 *
 * @module components/TableView/TableRows
 *
 * @example
 * <EnhancedTableRows id={tableId} />
 */

/**
 * TableRows Component
 *
 * A comprehensive data table component that renders table data with advanced features
 * including sorting, pagination, column hovering, and infinite scrolling. This component
 * displays tabular data in a Material-UI Table with enhanced user interactions.
 *
 * Key Features:
 * - Sortable columns with visual indicators (asc/desc/none cycling)
 * - Infinite scrolling with automatic pagination
 * - Column hover effects and highlighting
 * - Sticky row numbers for easy row identification
 * - Loading states and error handling
 * - Responsive column widths with text truncation
 * - Alternating row colors for better readability
 * - Sticky header that remains visible during scrolling
 *
 * ```
 */

/* eslint-disable react/prop-types */
import { withTableData } from "../HOC";
import { useRef, useCallback, useState, useEffect } from "react";
import { usePaginatedTableRows } from "../../hooks/index.js";
import RoundupTable from "../ui/Table/Table.jsx";

const placeHolderColumnLength = 11; // Number of placeholder columns when none are selected
const placeHolderRowLength = 20; // Number of placeholder rows when none are selected

const TableRows = ({
  // Props passed via withTableData HOC
  id,
  selectedColumnIds, // IDs of selected columns in Redux
  // Props passed directly from parent component
  showHeader = true,
  columnWidths = {}, // Optional prop for custom column widths
}) => {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableRows for table:", id);
  }
  const tableContainerRef = useRef(null);

  /**
   * Sorting configuration state
   * @type {Object} sortConfig - Current sort settings
   * @property {string|null} columnId - ID of column being sorted (null for no sort)
   * @property {string|null} direction - Sort direction: 'asc', 'desc', or null
   */
  const [sortConfig, setSortConfig] = useState({
    columnId: null,
    direction: null, // 'asc', 'desc', or null
  });

  const { data, loading, error, hasMore, loadMore, refresh } =
    usePaginatedTableRows(
      id,
      selectedColumnIds,
      50, // pageSize
      sortConfig.columnId, // sortBy
      sortConfig.direction // sortDirection
    );

  /**
   * Handles column sorting with three-state cycle: asc -> desc -> none -> asc
   * Clicking the same column cycles through sort states, clicking different column starts fresh
   *
   * @param {string} columnId - ID of the column to sort by
   */
  const handleColumnSort = useCallback((event, columnId) => {
    setSortConfig((prev) => {
      if (prev.columnId === columnId) {
        // Cycle through: asc -> desc -> none -> asc
        if (prev.direction === "asc") {
          return { columnId, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { columnId: null, direction: null };
        }
      }
      // First click or different column
      return { columnId, direction: "asc" };
    });
  }, []);

  const onScrollThreshold = useCallback(() => {
    if (hasMore && !loading && !error) {
      loadMore();
    }
  }, [hasMore, loading, error, loadMore]);

  // Load initial data only when table/columns/sort changes, not when refresh function changes
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedColumnIds, sortConfig.columnId, sortConfig.direction]);

  return (
    <RoundupTable
      columnIds={selectedColumnIds}
      data={data}
      loading={loading}
      error={error}
      sortConfig={sortConfig}
      onColumnSort={handleColumnSort}
      tableContainerRef={tableContainerRef}
      onScrollThreshold={onScrollThreshold}
      showHeader={showHeader}
      columnWidths={columnWidths}
      placeHolderColumnLength={placeHolderColumnLength}
      placeHolderRowLength={placeHolderRowLength}
    />
  );
};

// Set display name for debugging
TableRows.displayName = "TableRows";

/**
 * Enhanced TableRows component wrapped with the withTableData HOC
 * This is the recommended export that automatically provides table data from Redux state
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Table ID to load data for
 * @param {string[]} props.selectedColumnIds - Array of column IDs to display
 * @param {number} [props.hoveredIndex] - Index of currently hovered column
 * @param {Function} [props.hoverColumn] - Function called when column is hovered
 * @param {Function} [props.unhoverColumn] - Function called when column hover ends
 * @param {Function} [props.onScrollContainerRef] - Callback to register scroll container ref
 * @param {Function} [props.onScroll] - Callback for scroll events
 * @param {boolean} [props.showHeader] - Whether to show the table header
 * @param {Object} [props.columnWidths] - Custom width settings for columns
 * @returns {JSX.Element} The enhanced TableRows component with automatic data loading
 */
const EnhancedTableRows = withTableData(TableRows);

EnhancedTableRows.displayName = "EnhancedTableRows";

export { EnhancedTableRows, TableRows };
