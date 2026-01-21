/**
 * @fileoverview useTableRowData Hook
 *
 * A custom React hook for fetching table row data from DuckDB with sorting and
 * pagination support. Also exports usePaginatedTableRows for infinite scrolling
 * use cases.
 *
 * Features:
 * - Fetch table rows with column selection
 * - Sorting by column with direction control
 * - Pagination with limit and offset
 * - Auto-fetch on mount or dependency changes
 * - Manual refetch and reset capabilities
 * - Integration with Redux for table/column/operation metadata
 * - Database name resolution for views
 *
 * @module hooks/useTableRowData
 *
 * @example
 * const { data, loading, error, refetch } = useTableRowData(
 *   'table-id',
 *   ['col1', 'col2'],
 *   50,     // limit
 *   0,      // offset
 *   'col1', // sortBy
 *   'asc',  // sortDirection
 *   true    // autoFetch
 * );
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { getTableRows } from "../lib/duckdb/getTableRows.js";
import { useSelector } from "react-redux";
import { selectColumnsById } from "../slices/columnsSlice/selectors.js";
import { selectTablesById } from "../slices/tablesSlice/selectors.js";
import { selectOperationsById } from "../slices/operationsSlice/selectors.js";
import { isTableId } from "../slices/tablesSlice/Table.js";

/**
 * Custom React Hook for querying DuckDB database rows
 *
 * @param {string} tableId - The table identifier to query
 * @param {Array<string>} columnsList - Array of column names to select (null for all columns)
 * @param {number} limit - Maximum number of rows to fetch (default: 50)
 * @param {number} offset - Number of rows to skip (default: 0)
 * @param {string} sortBy - Column name to sort by (default: null)
 * @param {string} sortDirection - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @param {boolean} autoFetch - Whether to automatically fetch data when hook mounts or dependencies change (default: true)
 *
 * @returns {Object} Hook state and methods
 * @returns {Array} data - The fetched rows data
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {Function} refetch - Function to manually trigger data fetch
 * @returns {Function} reset - Function to reset state to initial values
 */
export function useTableRowData(
  tableId,
  columnsList = null,
  limit = 50,
  offset = 0,
  sortBy = null,
  sortDirection = "asc",
  autoFetch = true,
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!tableId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rows = await getTableRows(
        tableId,
        columnsList,
        limit,
        offset,
        sortBy,
        sortDirection,
      );
      setData(rows);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch table rows:", err);
    } finally {
      setLoading(false);
    }
  }, [tableId, columnsList, limit, offset, sortBy, sortDirection]);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset,
  };
}

/**
 * Specialized version for paginated data fetching
 * Appends new data instead of replacing it (useful for infinite scroll)
 *
 * @param {string} tableId - The table identifier to query
 * @param {Array<string>} columnIds - Array of column IDs to select
 * @param {number} pageSize - Number of rows per page (default: 50)
 * @param {string} sortBy - Column name to sort by (default: null)
 * @param {string} sortDirection - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @param {number} initialOffset - Starting row offset (default: 0, meaning start from row 1)
 * @param {number|null} rowLimit - Maximum total rows to load (null for unlimited)
 *
 * @returns {Object} Hook state and methods for pagination
 */
export function usePaginatedTableRows(
  tableId,
  columnIds = null,
  pageSize = 50,
  sortByColumnId = null,
  sortDirection = "asc",
  initialOffset = 0,
  rowLimit = null,
  isMaterialized = true,
) {
  const sortBy = useSelector(
    (state) => selectColumnsById(state, sortByColumnId)?.databaseName || null,
  );
  const table = useSelector((state) =>
    isTableId(tableId)
      ? selectTablesById(state, tableId)
      : selectOperationsById(state, tableId),
  );
  const columns = useSelector((state) => selectColumnsById(state, columnIds));
  const columnsList = useMemo(
    () => columns.map(({ databaseName }) => databaseName),
    [columns],
  );

  // Extract stable values from table to avoid object reference changes
  const tableDatabaseName = table?.databaseName;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (pageNum = 0, reset = false) => {
      if (!tableId || !isMaterialized) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const offset = initialOffset + pageNum * pageSize;

        // Calculate effective limit upfront
        let effectiveLimit = pageSize;
        if (rowLimit !== null) {
          effectiveLimit = Math.min(pageSize, rowLimit);
        }

        const rows = await getTableRows(
          tableDatabaseName,
          columnsList,
          effectiveLimit,
          offset,
          sortBy,
          sortDirection,
        );

        setData((prevData) => {
          const newData =
            reset || pageNum === 0 ? rows : [...prevData, ...rows];

          // Calculate hasMore based on actual new data
          if (rowLimit !== null) {
            setHasMore(
              newData.length < rowLimit && rows.length === effectiveLimit,
            );
          } else {
            setHasMore(rows.length === pageSize);
          }

          return newData;
        });

        setCurrentPage(pageNum);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch paginated table rows:", err);
      } finally {
        setLoading(false);
      }
    },
    [
      tableId,
      columnIds,
      initialOffset,
      pageSize,
      rowLimit,
      tableDatabaseName,
      columnsList,
      sortBy,
      sortDirection,
    ],
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(currentPage + 1, false);
    }
  }, [fetchPage, currentPage, loading, hasMore]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
    setCurrentPage(0);
    setHasMore(true);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    currentPage,
    loadMore,
    refresh,
    reset,
  };
}
