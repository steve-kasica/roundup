/**
 * @fileoverview ColumnValues Component
 *
 * Displays a scrollable list of raw values from a column, providing a direct view
 * into the actual data. This component implements infinite scroll with lazy loading
 * to efficiently handle columns with large numbers of rows.
 *
 * The component also supports scroll position synchronization, making it useful for
 * side-by-side comparisons or synchronized scrolling scenarios.
 *
 * Features:
 * - Lazy loading with infinite scroll
 * - Scroll position tracking and synchronization
 * - Automatic reset when column or parent changes
 * - Error handling with user feedback
 * - Null value display with italic styling
 *
 * @module components/ColumnViews/ColumnValues
 *
 * @example
 * <EnhancedColumnValues
 *   id="column-123"
 *   limit={20}
 *   scrollTop={0}
 *   onScroll={handleScroll}
 * />
 */

/* eslint-disable react/prop-types */
import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { getColumnValues } from "../../lib/duckdb";
import { withColumnData } from "../HOC";
import { useSelector } from "react-redux";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";

/**
 * ColumnValues Component
 *
 * Renders a scrollable list of column values with lazy loading.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Column identifier
 * @param {string} props.databaseName - Internal database name for the column
 * @param {string} props.parentId - ID of parent table or operation
 * @param {number} [props.limit=20] - Number of values to load per page
 * @param {number} [props.scrollTop=0] - External scroll position to sync to
 * @param {Function} [props.onScroll] - Callback when scroll position changes
 *
 * @returns {React.ReactElement} A scrollable list of column values
 *
 * @description
 * Loading behavior:
 * - Fetches initial batch of values on mount
 * - Loads more values when scrolled near bottom
 * - Resets and refetches when column changes
 * - Syncs scroll position with external control
 *
 * The component maintains internal state for:
 * - Current values array
 * - Loading state
 * - Error state
 * - Current offset for pagination
 * - Whether more data is available
 */
const ColumnValues = ({
  id,
  databaseName: columnDatabaseName,
  parentId,
  limit = 20,
  scrollTop = 0,
  onScroll = () => null,
}) => {
  const [values, setValues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const table = useSelector((state) =>
    isTableId(parentId)
      ? selectTablesById(state, parentId)
      : selectOperationsById(state, parentId)
  );

  // Reset state when id or parentId changes
  useEffect(() => {
    setValues([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, [id, parentId]);

  // Load values when offset changes or initial load
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getColumnValues(table.databaseName, columnDatabaseName, limit, offset)
      .then((result) => {
        if (isMounted) {
          setValues((prev) =>
            Array.isArray(result) ? [...prev, ...result] : prev
          );
          setHasMore(Array.isArray(result) && result.length === limit);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, parentId, offset, limit, table.databaseName, columnDatabaseName]);

  // Remove handleLoadMore and inline logic in scroll handler to avoid dependency warning

  // Add scroll event listener for lazy loading and sync
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Set scroll position when scrollTop changes
    if (container.scrollTop !== scrollTop) {
      container.scrollTop = scrollTop;
    }
    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
      ) {
        if (hasMore && !loading) {
          setOffset((prev) => prev + limit);
        }
      }
      // Notify parent of scroll position
      if (onScroll) {
        onScroll(container.scrollTop);
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading, limit, scrollTop, onScroll]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #eee",
        borderRadius: "4px",
        marginBottom: "10px",
        height: "100%", // Fixed height to enable scrolling
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          padding: "0.5rem",
          overflowY: "auto",
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        {values.map((value, i) => (
          <Typography
            key={i}
            component="div"
            sx={{
              padding: "0.25rem 0",
            }}
          >
            {value}
          </Typography>
        ))}
        {error && <Typography color="error">Error: {error}</Typography>}
        {loading && <Typography>Loading values...</Typography>}
      </Box>
    </Box>
  );
};

ColumnValues.displayName = "ColumnValues";

const EnhancedColumnValues = withColumnData(ColumnValues);

EnhancedColumnValues.displayName = "EnhancedColumnValues";

export { EnhancedColumnValues, ColumnValues };
