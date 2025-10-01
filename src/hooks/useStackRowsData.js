import { useState, useEffect, useCallback } from "react";
import { getStackRows } from "../lib/duckdb";

/**
 * Specialized version for paginated stacked data fetching
 * Appends new data instead of replacing it (useful for infinite scroll)
 *
 * @param {Array<string>} tableIds - Array of table identifiers to union
 * @param {Array<Array<string>>|Array<string>} columnIds - Matrix of column names or single array for all tables
 * @param {number} pageSize - Number of rows per page (default: 50)
 * @param {string} sortBy - Column name to sort combined results by (default: null)
 * @param {string} sortDirection - Sort direction: 'asc' or 'desc' (default: 'asc')
 *
 * @returns {Object} Hook state and methods for pagination
 */
export function usePaginatedStackRows(
  tableIds,
  columnIds = null,
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
      if (!tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const offset = pageNum * pageSize;
        const rows = await getStackRows(
          tableIds,
          columnIds,
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
        console.error("Failed to fetch paginated stacked table rows:", err);
      } finally {
        setLoading(false);
      }
    },
    [tableIds, columnIds, pageSize, sortBy, sortDirection]
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

  // Auto-fetch first page on mount or when core query parameters change
  // But don't refresh during pagination
  useEffect(() => {
    // Only refresh if we don't have any data yet, or if it's a genuine parameter change
    if (data.length === 0) {
      refresh();
    }
  }, [refresh, data.length]);

  // Separate effect to handle parameter changes that should trigger a fresh start
  useEffect(() => {
    // Reset and refresh when core parameters change
    setData([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
  }, [tableIds, columnIds, sortBy, sortDirection]);

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
