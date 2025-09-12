import { useState, useEffect, useCallback } from "react";
import { getTableRows } from "../lib/duckdb";

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
  autoFetch = true
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
        sortDirection
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
 * @param {Array<string>} columnsList - Array of column names to select
 * @param {number} pageSize - Number of rows per page (default: 50)
 * @param {string} sortBy - Column name to sort by (default: null)
 * @param {string} sortDirection - Sort direction: 'asc' or 'desc' (default: 'asc')
 *
 * @returns {Object} Hook state and methods for pagination
 */
export function usePaginatedTableRows(
  tableId,
  columnsList = null,
  pageSize = 50,
  sortBy = null,
  sortDirection = "asc"
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (pageNum = 0, reset = false) => {
      if (!tableId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const offset = pageNum * pageSize;
        const rows = await getTableRows(
          tableId,
          columnsList,
          pageSize,
          offset,
          sortBy,
          sortDirection
        );

        setData((prevData) => {
          if (reset || pageNum === 0) {
            return rows;
          }
          return [...prevData, ...rows];
        });

        // Check if we have more data
        setHasMore(rows.length === pageSize);
        setCurrentPage(pageNum);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch paginated table rows:", err);
      } finally {
        setLoading(false);
      }
    },
    [tableId, columnsList, pageSize, sortBy, sortDirection]
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

  // Auto-fetch first page on mount or dependency changes
  useEffect(() => {
    refresh();
  }, [refresh]);

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
