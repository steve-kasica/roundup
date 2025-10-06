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
 * @component
 * @example
 * ```jsx
 * // Basic usage (typically wrapped with withTableData HOC)
 * <TableRows
 *   table={tableObject}
 *   selectedColumnIds={['col1', 'col2', 'col3']}
 *   hoverColumn={handleHover}
 *   unhoverColumn={handleUnhover}
 * />
 *
 * // Enhanced version with HOC (recommended usage)
 * <EnhancedTableRows
 *   id="table-1"
 *   selectedColumnIds={['col1', 'col2']}
 * />
 * ```
 */

/* eslint-disable react/prop-types */
import withTableData from "./withTableData.jsx";
import { useRef, useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  styled,
} from "@mui/material";
import { usePaginatedTableRows } from "../../hooks/index.js";
import {
  StyledAlternatingTableRow,
  StyledTableCell,
  StickyTableCell,
} from "../ui/Table";
import { EnhancedColumnHeader } from "../ColumnViews";

/**
 * TableRows component renders paginated, sortable table data with advanced interactions
 *
 * @param {Object} props - Component props
 * @param {Object} props.table - Table object containing metadata
 * @param {string} props.table.id - Unique identifier for the table
 * @param {string[]} props.selectedColumnIds - Array of column IDs to display
 * @param {number} [props.hoveredIndex=0] - Index of currently hovered column
 * @param {Function} props.hoverColumn - Function called when column is hovered
 * @param {Function} props.unhoverColumn - Function called when column hover ends
 * @param {Function} [props.onScrollContainerRef=null] - Callback to register scroll container ref
 * @param {Function} [props.onScroll=null] - Callback for scroll events
 * @param {boolean} [props.showHeader=true] - Whether to show the table header
 * @param {Object} [props.columnWidths={}] - Custom width settings for columns
 * @returns {JSX.Element} The rendered TableRows component
 */
const TableRows = ({
  table,
  selectedColumnIds,
  hoveredIndex = 0,
  onScrollContainerRef = null,
  onScroll = null,
  showHeader = true,
  columnWidths = {}, // Optional prop for custom column widths
}) => {
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

  // Hook for managing paginated data with sorting
  const { data, loading, error, hasMore, loadMore, refresh } =
    usePaginatedTableRows(
      table.id,
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

  /**
   * Registers the table container reference with parent component
   * Allows parent to coordinate scrolling across multiple table instances
   */
  useEffect(() => {
    if (tableContainerRef.current && onScrollContainerRef) {
      onScrollContainerRef(tableContainerRef.current);
    }
  }, [onScrollContainerRef]);

  /**
   * Handles scroll events for infinite scrolling and parent coordination
   * Triggers pagination when near bottom and notifies parent of scroll position
   *
   * @param {Event} event - Scroll event from the table container
   */
  const handleScroll = useCallback(
    (event) => {
      const container = event.target;
      const { scrollTop, scrollHeight, clientHeight, scrollLeft } = container;

      // Notify parent of scroll position for coordination
      // parent will know which child is the source
      if (onScroll) {
        onScroll(scrollLeft, scrollTop);
      }

      // Check if user has scrolled near the bottom (within 100px)
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom && hasMore && !loading && !error) {
        loadMore();
      }
    },
    [hasMore, loading, error, loadMore, onScroll]
  );

  return (
    <TableContainer
      ref={tableContainerRef}
      onScroll={handleScroll}
      sx={{ height: "100%", overflow: "auto" }}
    >
      <Table size="small" stickyHeader sx={{ width: "auto" }}>
        {/* Table Header - Sortable column headers with hover effects */}
        {showHeader && (
          <TableHead>
            <TableRow>
              {/* Sticky Row Number Header */}
              <StickyTableCell sx={{ zIndex: 3, backgroundColor: "#f5f5f5" }}>
                #
              </StickyTableCell>

              {/* Column Headers with Sorting */}
              {selectedColumnIds.map((colId, i) => (
                <TableCell key={`${i}-${colId}`} align="center" sx={{ p: 1 }}>
                  <EnhancedColumnHeader
                    id={colId}
                    isActive={sortConfig.columnId === colId}
                    onSort={handleColumnSort}
                    sortDirection={sortConfig.direction}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}

        {/* Table Body - Data rows with loading, error, and pagination states */}
        <TableBody>
          {/* Error State - Full-width error message with retry option */}
          {error ? (
            <TableRow sx={{ height: "100%" }}>
              <TableCell
                colSpan={selectedColumnIds.length + 1}
                sx={{
                  height: "100%",
                  verticalAlign: "middle",
                  padding: 2,
                }}
              >
                <Alert
                  severity="error"
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                  action={
                    <Button color="inherit" size="small" onClick={refresh}>
                      Retry
                    </Button>
                  }
                >
                  Error loading table data: {error?.message || "Unknown error"}
                </Alert>
              </TableCell>
            </TableRow>
          ) : loading && data.length === 0 ? (
            /* Initial Loading State - Skeleton rows with loading indicators */
            Array.from({ length: 10 }).map((_, rowIndex) => (
              <StyledAlternatingTableRow
                key={`loading-${rowIndex}`}
                isEven={rowIndex % 2 === 0}
              >
                <StickyTableCell>{rowIndex + 1}</StickyTableCell>
                {selectedColumnIds.map((colId, i) => (
                  <StyledTableCell
                    key={colId}
                    align="center"
                    isHovered={hoveredIndex === i}
                    isEven={rowIndex % 2 === 0}
                    maxWidth={columnWidths[colId] || "200px"}
                  >
                    <CircularProgress size={16} />
                  </StyledTableCell>
                ))}
              </StyledAlternatingTableRow>
            ))
          ) : (
            /* Data Rows - Actual table content with alternating colors and hover effects */
            <>
              {data.map((row, rowIndex) => (
                <StyledAlternatingTableRow
                  key={rowIndex}
                  isEven={rowIndex % 2 === 0}
                >
                  {/* Row Number Cell */}
                  <StickyTableCell>{rowIndex + 1}</StickyTableCell>

                  {/* Data Cells with proper formatting for different data types */}
                  {row.map((value, i) => (
                    <StyledTableCell
                      key={selectedColumnIds[i]}
                      isHovered={hoveredIndex === i}
                      isEven={rowIndex % 2 === 0}
                      maxWidth={columnWidths[selectedColumnIds[i]] || "200px"}
                    >
                      {value === null ? (
                        <Typography
                          color="text.secondary"
                          sx={{ fontStyle: "italic", opacity: 0.6 }}
                        >
                          NULL
                        </Typography>
                      ) : typeof value === "number" ? (
                        value.toLocaleString()
                      ) : (
                        value
                      )}
                    </StyledTableCell>
                  ))}
                </StyledAlternatingTableRow>
              ))}

              {/* Pagination Loading Indicator - Shows when loading more data */}
              {loading && data.length > 0 && (
                <StyledAlternatingTableRow isEven={data.length % 2 === 0}>
                  <TableCell
                    colSpan={selectedColumnIds.length + 1}
                    align="center"
                  >
                    <Box
                      sx={{
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress size={20} />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        Loading more rows...
                      </Typography>
                    </Box>
                  </TableCell>
                </StyledAlternatingTableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
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
