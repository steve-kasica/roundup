/**
 * @fileoverview useColumnKeyRankData Hook
 *
 * A custom React hook for ranking column pairs based on their Jaccard Index similarity.
 * Computes the Jaccard Index (set similarity measure) for all pairs of columns from two
 * different tables, returning results sorted by highest similarity score first.
 *
 * Features:
 * - Rank column pairs by Jaccard Index (0-1 scale)
 * - Cartesian product of left and right column sets
 * - Pagination support (offset/limit)
 * - Auto-fetch on mount or dependency changes
 * - Manual refetch and reset capabilities
 * - Integration with Redux for table/column metadata
 * - Automatic database name resolution
 *
 * @module hooks/useColumnKeyRankData
 *
 * @example
 * const { data, loading, error, hasMore, loadMore } = useColumnKeyRankData(
 *   'col1',  // leftKeyId
 *   ['col2', 'col3', 'col4']   // rightColumnIds
 * );
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectColumnsById } from "../slices/columnsSlice";
import { selectTablesById } from "../slices/tablesSlice";
import { selectOperationsById } from "../slices/operationsSlice";
import { isTableId } from "../slices/tablesSlice";
import { rankColumnKeys } from "../lib/duckdb/rankColumnKeys";

/**
 * Custom React Hook for ranking column pairs by Jaccard Index similarity.
 * Compares unique values between one left column and multiple right columns.
 *
 * @param {string} leftKeyId - The ID of the left column
 * @param {Array<string>} rightColumnIds - Array of right column IDs to compare against
 * @param {number} pageSize - Number of results per page (default: 100)
 * @param {boolean} autoFetch - Whether to automatically fetch data when hook mounts (default: true)
 *
 * @returns {Object} Hook state and methods
 * @returns {Array<{left_column: string, right_column: string, jaccard_index: number}>} data - Ranked column pairs with similarity scores
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {boolean} hasMore - Whether more results are available to load
 * @returns {Function} loadMore - Function to load next page of results
 * @returns {Function} refetch - Function to reset and fetch from beginning
 * @returns {Function} reset - Function to reset state to initial values
 */
export function useColumnKeyRankData(
  leftColumnIds,
  rightColumnIds,
  pageSize = 100,
  autoFetch = true,
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Get left columns from Redux
  const leftColumns = useSelector((state) =>
    selectColumnsById(state, leftColumnIds),
  );

  // Get right columns from Redux
  const rightColumns = useSelector((state) =>
    selectColumnsById(state, rightColumnIds),
  );

  // Get the table for the left column to find its database name
  const leftTable = useSelector((state) => {
    const leftFirstColumn = leftColumns?.[0];
    if (!leftFirstColumn?.parentId) return null;
    return isTableId(leftFirstColumn.parentId)
      ? selectTablesById(state, leftFirstColumn.parentId)
      : selectOperationsById(state, leftFirstColumn.parentId);
  });

  // Get the table for the right columns to find its database name
  // Assumes all right columns come from the same table
  const rightTable = useSelector((state) => {
    const firstRightColumn = rightColumns?.[0];
    if (!firstRightColumn?.parentId) return null;
    return isTableId(firstRightColumn.parentId)
      ? selectTablesById(state, firstRightColumn.parentId)
      : selectOperationsById(state, firstRightColumn.parentId);
  });

  const leftTableDatabaseName = useMemo(
    () => leftTable?.databaseName,
    [leftTable],
  );
  const rightTableDatabaseName = useMemo(
    () => rightTable?.databaseName,
    [rightTable],
  );
  const leftColumnsDatabaseNames = useMemo(
    () => leftColumns?.map(({ databaseName }) => databaseName) || [],
    [leftColumns],
  );
  const rightColumnsDatabaseNames = useMemo(
    () => rightColumns?.map(({ databaseName }) => databaseName) || [],
    [rightColumns],
  );

  // Fetch data function
  const fetchData = useCallback(
    async (currentOffset = 0, append = false) => {
      if (
        !leftTableDatabaseName ||
        !rightTableDatabaseName ||
        !leftColumnsDatabaseNames.length ||
        !rightColumnsDatabaseNames.length
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await rankColumnKeys(
          leftTableDatabaseName,
          leftColumnsDatabaseNames,
          rightTableDatabaseName,
          rightColumnsDatabaseNames,
          currentOffset,
          pageSize,
        );

        // If we got fewer results than pageSize, there are no more results
        setHasMore(results.length === pageSize);

        if (append) {
          setData((prevData) => [...prevData, ...results]);
        } else {
          setData(results);
        }
      } catch (err) {
        setError(err);
        console.error("Failed to fetch column key rankings:", err);
      } finally {
        setLoading(false);
      }
    },
    [
      leftTableDatabaseName,
      rightTableDatabaseName,
      leftColumnsDatabaseNames,
      rightColumnsDatabaseNames,
      pageSize,
    ],
  );

  // Load more results (pagination)
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    const newOffset = offset + pageSize;
    setOffset(newOffset);
    fetchData(newOffset, true);
  }, [loading, hasMore, offset, pageSize, fetchData]);

  // Refetch from beginning
  const refetch = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    fetchData(0, false);
  }, [fetchData]);

  // Reset to initial state
  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
    setOffset(0);
    setHasMore(true);
  }, []);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (autoFetch) {
      setOffset(0);
      setHasMore(true);
      fetchData(0, false);
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    reset,
  };
}
