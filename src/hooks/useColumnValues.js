import { useState, useEffect, useCallback } from "react";
import { getColumnValues } from "../lib/duckdb/getColumnValues.js";

/**
 * Custom React Hook for querying DuckDB database column values
 *
 * @param {string} tableId - The table identifier to query
 * @param {string} columnId - The column identifier to get values from
 * @param {number} limit - Maximum number of values to fetch (default: null for all values)
 * @param {number} offset - Number of values to skip (default: 0)
 * @param {boolean} autoFetch - Whether to automatically fetch data when hook mounts or dependencies change (default: true)
 *
 * @returns {Object} Hook state and methods
 * @returns {Array} data - The fetched column values
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {Function} refetch - Function to manually trigger data fetch
 * @returns {Function} reset - Function to reset state to initial values
 */
export function useColumnValues(
  tableId,
  columnId,
  limit = null,
  offset = 0,
  autoFetch = true
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!tableId || !columnId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const values = await getColumnValues(tableId, columnId, limit, offset);
      setData(values);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch column values:", err);
    } finally {
      setLoading(false);
    }
  }, [tableId, columnId, limit, offset]);

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
 * Specialized version for paginated column values fetching
 * Appends new data instead of replacing it (useful for infinite scroll)
 *
 * @param {string} tableId - The table identifier to query
 * @param {string} columnId - The column identifier to get values from
 * @param {number} pageSize - Number of values per page (default: 50)
 *
 * @returns {Object} Hook state and methods for pagination
 */
export function usePaginatedColumnValues(tableId, columnId, pageSize = 50) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (pageNum = 0, reset = false) => {
      if (!tableId || !columnId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const offset = pageNum * pageSize;
        const values = await getColumnValues(
          tableId,
          columnId,
          pageSize,
          offset
        );

        setData((prevData) => {
          if (reset || pageNum === 0) {
            return values;
          }
          return [...prevData, ...values];
        });

        // Check if we have more data
        setHasMore(values.length === pageSize);
        setCurrentPage(pageNum);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch paginated column values:", err);
      } finally {
        setLoading(false);
      }
    },
    [tableId, columnId, pageSize]
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
