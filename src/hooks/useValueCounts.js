import { useState, useEffect, useCallback, useRef } from "react";
import {
  getValueCounts,
  getPaginatedValueCounts,
} from "../lib/duckdb/getValueCounts";

/**
 * Custom hook for fetching value counts for multiple columns
 * Executes one DB call per column and manages loading/error states independently
 *
 * @param {string} tableId - The table identifier
 * @param {Array<string>} columnIds - Array of column identifiers
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Maximum results per column (default: 100)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @param {boolean} options.enabled - Whether to execute queries (default: true)
 * @param {boolean} options.paginated - Whether to use paginated results (default: false)
 * @returns {Object} Hook state and methods
 */
export function useKeyComparisonStats(
  leftTableId,
  leftColumnId,
  rightTableId,
  rightColumnId,
  joinPredicate,
  options = {}
) {
  const {
    limit = 100,
    offset = 0,
    enabled = true,
    paginated = false,
  } = options;

  // State for each column's data
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [metadata, setMetadata] = useState({}); // For paginated results

  // Track active requests to prevent race conditions
  const activeRequestsRef = useRef(new Set());
  const isMountedRef = useRef(true);

  // Overall loading state
  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.keys(errors).length > 0;
  const hasData = Object.keys(data).length > 0;

  // Fetch data for a single column
  const fetchColumnData = useCallback(
    async (tableId, columnId) => {
      if (!tableId || !columnId || !enabled) return;

      const requestKey = `${tableId}-${columnId}-${limit}-${offset}`;

      // Prevent duplicate requests
      if (activeRequestsRef.current.has(requestKey)) return;
      activeRequestsRef.current.add(requestKey);

      // Set loading state for this column
      setLoading((prev) => ({ ...prev, [columnId]: true }));

      // Clear any previous error for this column
      setErrors((prev) => {
        const { [columnId]: removed, ...rest } = prev;
        return rest;
      });

      try {
        let result;

        if (paginated) {
          result = await getValueCounts(tableId, columnId, limit, offset);

          // Store metadata for paginated results
          if (isMountedRef.current) {
            setMetadata((prev) => ({
              ...prev,
              [columnId]: {
                hasMore: result.hasMore,
                total: result.total,
                offset: result.offset,
                limit: result.limit,
                currentCount: result.currentCount,
              },
            }));
            setData((prev) => ({ ...prev, [columnId]: result.data }));
          }
        } else {
          result = await getValueCounts(tableId, columnId, limit, offset);

          if (isMountedRef.current) {
            setData((prev) => ({ ...prev, [columnId]: result }));
          }
        }
      } catch (error) {
        console.error(
          `Error fetching value counts for column ${columnId}:`,
          error
        );

        if (isMountedRef.current) {
          setErrors((prev) => ({
            ...prev,
            [columnId]: error,
          }));
        }
      } finally {
        activeRequestsRef.current.delete(requestKey);

        if (isMountedRef.current) {
          setLoading((prev) => ({ ...prev, [columnId]: false }));
        }
      }
    },
    [tableId, limit, offset, enabled, paginated]
  );

  // Fetch data for all columns
  const fetchAllColumns = useCallback(async () => {
    if (!columnIds.length) return;

    // Execute all requests in parallel
    const promises = columnIds.map((columnId) => fetchColumnData(columnId));
    await Promise.allSettled(promises);
  }, [columnIds, fetchColumnData]);

  // Refetch data for specific columns or all columns
  const refetch = useCallback(
    (specificColumnIds = null) => {
      const columnsToRefetch = specificColumnIds || columnIds;

      if (Array.isArray(columnsToRefetch)) {
        columnsToRefetch.forEach((columnId) => fetchColumnData(columnId));
      } else {
        fetchColumnData(columnsToRefetch);
      }
    },
    [columnIds, fetchColumnData]
  );

  // Reset state
  const reset = useCallback(() => {
    setData({});
    setLoading({});
    setErrors({});
    setMetadata({});
    activeRequestsRef.current.clear();
  }, []);

  // Load more data for paginated results
  const loadMore = useCallback(
    async (columnId) => {
      if (!paginated || !metadata[columnId]?.hasMore) return;

      const newOffset =
        (metadata[columnId]?.offset || 0) +
        (metadata[columnId]?.limit || limit);

      try {
        setLoading((prev) => ({ ...prev, [columnId]: true }));

        const result = await getPaginatedValueCounts(
          tableId,
          columnId,
          limit,
          newOffset
        );

        if (isMountedRef.current) {
          // Merge new data with existing data
          setData((prev) => ({
            ...prev,
            [columnId]: { ...prev[columnId], ...result.data },
          }));

          // Update metadata
          setMetadata((prev) => ({
            ...prev,
            [columnId]: {
              hasMore: result.hasMore,
              total: result.total,
              offset: result.offset,
              limit: result.limit,
              currentCount: Object.keys({ ...prev[columnId], ...result.data })
                .length,
            },
          }));
        }
      } catch (error) {
        console.error(`Error loading more data for column ${columnId}:`, error);

        if (isMountedRef.current) {
          setErrors((prev) => ({ ...prev, [columnId]: error }));
        }
      } finally {
        if (isMountedRef.current) {
          setLoading((prev) => ({ ...prev, [columnId]: false }));
        }
      }
    },
    [paginated, metadata, limit, tableId]
  );

  // Effect to fetch data when dependencies change
  useEffect(() => {
    if (enabled && tableId && columnIds.length > 0) {
      fetchAllColumns();
    }
  }, [
    enabled,
    tableId,
    JSON.stringify(columnIds),
    limit,
    offset,
    fetchAllColumns,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      activeRequestsRef.current.clear();
    };
  }, []);

  // Helper functions for individual columns
  const getColumnData = useCallback((columnId) => data[columnId] || {}, [data]);
  const getColumnError = useCallback(
    (columnId) => errors[columnId] || null,
    [errors]
  );
  const getColumnLoading = useCallback(
    (columnId) => loading[columnId] || false,
    [loading]
  );
  const getColumnMetadata = useCallback(
    (columnId) => metadata[columnId] || null,
    [metadata]
  );

  return {
    // Data state
    data,
    loading,
    errors,
    metadata,

    // Overall state
    isLoading,
    hasErrors,
    hasData,
    isEmpty: !isLoading && !hasData && !hasErrors,

    // Methods
    refetch,
    reset,
    loadMore,

    // Helper functions for individual columns
    getColumnData,
    getColumnError,
    getColumnLoading,
    getColumnMetadata,

    // Convenience methods
    isColumnLoading: getColumnLoading,
    hasColumnError: (columnId) => !!getColumnError(columnId),
    hasColumnData: (columnId) =>
      Object.keys(getColumnData(columnId)).length > 0,
  };
}

export default useKeyComparisonStats;
