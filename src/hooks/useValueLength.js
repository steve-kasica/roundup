import { useState, useEffect, useCallback } from "react";
import {
  getValueLengths,
  getPaginatedValueLengths,
} from "../lib/duckdb/getValueLength";
import { useSelector } from "react-redux";
import { isTableId, selectTablesById } from "../slices/tablesSlice";
import { selectColumnsById } from "../slices/columnsSlice";
import { selectOperationsById } from "../slices/operationsSlice";

/**
 * Custom React Hook for querying value lengths for a column
 * Returns an array of objects with length, count, and example values
 *
 * @param {string} tableName - The table identifier to query
 * @param {string} databaseName - The column identifier to get value lengths from
 * @param {number} limit - Maximum number of unique lengths to fetch (default: null for all lengths)
 * @param {number} offset - Number of unique lengths to skip (default: 0)
 * @param {boolean} autoFetch - Whether to automatically fetch data when hook mounts or dependencies change (default: true)
 *
 * @returns {Object} Hook state and methods
 * @returns {Array} data - Array of objects with length, count, and examples
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {Function} refetch - Function to manually trigger data fetch
 * @returns {Function} reset - Function to reset state to initial values
 */
export function useValueLength(
  tableName,
  columnName,
  limit = null,
  offset = 0,
  autoFetch = true
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!tableName || !columnName) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lengths = await getValueLengths(
        tableName,
        columnName,
        limit,
        offset
      );
      setData(lengths);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch value lengths:", err);
    } finally {
      setLoading(false);
    }
  }, [tableName, columnName, limit, offset]);

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
 * Specialized version for paginated value lengths fetching
 * Merges new data with existing data (useful for infinite scroll)
 *
 * @param {string} id - The column identifier to query
 * @param {number} pageSize - Number of unique lengths per page (default: 100)
 *
 * @returns {Object} Hook state and methods for pagination
 * @returns {Array} data - Array of objects with length, count, and examples
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {boolean} hasMore - Whether more data is available
 * @returns {number} total - Total number of unique lengths
 * @returns {number} currentPage - Current page number
 * @returns {Function} loadMore - Function to load next page
 * @returns {Function} refresh - Function to refresh data from start
 * @returns {Function} reset - Function to reset state to initial values
 */
export function usePaginatedValueLength(id, pageSize = 100) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const column = useSelector((state) => selectColumnsById(state, id));

  const table = useSelector((state) =>
    isTableId(column?.parentId)
      ? selectTablesById(state, column?.parentId)
      : selectOperationsById(state, column?.parentId)
  );

  const fetchPage = useCallback(
    async (pageNum = 0, reset = false) => {
      if (!table || !column) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const offset = pageNum * pageSize;
        const result = await getPaginatedValueLengths(
          table.databaseName,
          column.databaseName,
          pageSize,
          offset
        );

        setData((prevData) => {
          if (reset || pageNum === 0) {
            return result.data;
          }
          return [...prevData, ...result.data];
        });

        setHasMore(result.hasMore);
        setTotal(result.total);
        setCurrentPage(pageNum);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch paginated value lengths:", err);
      } finally {
        setLoading(false);
      }
    },
    [table, column, pageSize]
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
    setTotal(0);
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
    total,
    currentPage,
    loadMore,
    refresh,
    reset,
  };
}
