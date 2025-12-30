/**
 * @fileoverview useValueCounts Hook
 *
 * A custom React hook for querying value counts (frequency distribution) for a column
 * from DuckDB. Returns unique values with their occurrence counts, supporting pagination
 * for large datasets.
 *
 * Features:
 * - Fetch value counts (value -> count mapping)
 * - Pagination with limit and offset
 * - Paginated version for infinite scrolling
 * - Auto-fetch on mount or dependency changes
 * - Manual refetch and reset capabilities
 * - Integration with Redux for table/column/operation metadata
 * - Database name resolution for views
 *
 * @module hooks/useValueCounts
 *
 * @example
 * const { data, loading, error, refetch } = useValueCounts(
 *   'table-id',
 *   'column_name',
 *   100,  // limit
 *   0,    // offset
 *   true  // autoFetch
 * );
 */

import { useState, useEffect, useCallback } from "react";
import {
  getValueCounts,
  getPaginatedValueCounts,
} from "../lib/duckdb/getValueCounts";
import { useSelector } from "react-redux";
import { isTableId, selectTablesById } from "../slices/tablesSlice";
import { selectColumnsById } from "../slices/columnsSlice";
import { selectOperationsById } from "../slices/operationsSlice";

/**
 * Custom React Hook for querying value counts for a column
 * Returns an object with values as keys and their occurrence counts as values
 *
 * @param {string} tableId - The table identifier to query
 * @param {string} databaseName - The column identifier to get value counts from
 * @param {number} limit - Maximum number of unique values to fetch (default: null for all values)
 * @param {number} offset - Number of unique values to skip (default: 0)
 * @param {boolean} autoFetch - Whether to automatically fetch data when hook mounts or dependencies change (default: true)
 *
 * @returns {Object} Hook state and methods
 * @returns {Object} data - Object with values as keys and counts as values
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {Function} refetch - Function to manually trigger data fetch
 * @returns {Function} reset - Function to reset state to initial values
 */
export function useValueCounts(
  tableId,
  databaseName,
  limit = null,
  offset = 0,
  autoFetch = true
) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!tableId || !databaseName) {
      setData({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const counts = await getValueCounts(tableId, databaseName, limit, offset);
      setData(counts);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch value counts:", err);
    } finally {
      setLoading(false);
    }
  }, [tableId, databaseName, limit, offset]);

  const reset = useCallback(() => {
    setData({});
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
 * Specialized version for paginated value counts fetching
 * Merges new data with existing data (useful for infinite scroll)
 *
 * @param {string} tableId - The table identifier to query
 * @param {string} databaseName - The column identifier to get value counts from
 * @param {number} pageSize - Number of unique values per page (default: 100)
 *
 * @returns {Object} Hook state and methods for pagination
 * @returns {Object} data - Object with values as keys and counts as values
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {boolean} hasMore - Whether more data is available
 * @returns {number} total - Total number of unique values
 * @returns {number} currentPage - Current page number
 * @returns {Function} loadMore - Function to load next page
 * @returns {Function} refresh - Function to refresh data from start
 * @returns {Function} reset - Function to reset state to initial values
 */
export function usePaginatedValueCounts(id, pageSize = 100) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const column = useSelector((state) => selectColumnsById(state, id));

  const table = useSelector((state) =>
    isTableId(column.parentId)
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
        const result = await getPaginatedValueCounts(
          table.databaseName,
          column.databaseName,
          pageSize,
          offset
        );

        setData((prevData) => {
          if (reset || pageNum === 0) {
            return result.data;
          }
          return { ...prevData, ...result.data };
        });

        setHasMore(result.hasMore);
        setTotal(result.total);
        setCurrentPage(pageNum);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch paginated value counts:", err);
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
    setData({});
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
