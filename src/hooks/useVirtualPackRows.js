import { useState, useEffect, useCallback } from "react";
import { getPackVirtualRows } from "../lib/duckdb/getPackVirtualRows";
import { useSelector, shallowEqual } from "react-redux";
import { selectColumnById } from "../slices/columnsSlice";

/**
 * React hook for fetching and managing packed (joined) table rows from DuckDB.
 *
 * This hook manages the loading state and provides methods to fetch rows from two
 * tables joined together, filtered by a specific match type (one-to-one, one-to-many, etc.).
 * It handles pagination for the selected match type.
 *
 * @param {string} leftTableId - Identifier for the left table
 * @param {string} rightTableId - Identifier for the right table
 * @param {Array<string>} leftColumnIds - Array of column IDs to select from left table
 * @param {Array<string>} rightColumnIds - Array of column IDs to select from right table
 * @param {string} leftKeyColumnId - ID of the key column in the left table used for joining
 * @param {string} rightKeyColumnId - ID of the key column in the right table used for joining
 * @param {string} joinPredicate - Type of join predicate: "EQUALS", "CONTAINS", "STARTS_WITH", or "ENDS_WITH"
 * @param {string} matchType - The type of match to filter by: "oneToOne", "oneToMany", "manyToOne", "manyToMany", "oneToZero", or "zeroToOne"
 * @param {number} [pageSize=50] - Number of rows per page
 *
 * @returns {Object} Hook state and methods
 * @returns {Array<Array>} returns.data - Array of rows matching the specified match type
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {Error|null} returns.error - Error object if query failed
 * @returns {boolean} returns.hasMore - Whether more data is available
 * @returns {number} returns.currentPage - Current page number
 * @returns {Function} returns.loadMore - Load next page of data
 * @returns {Function} returns.refresh - Refresh data from first page
 * @returns {Function} returns.reset - Reset state to initial values
 *
 * @example
 * const { data, loading, error, hasMore, loadMore } = useVirtualPackRows(
 *   "customers",
 *   "orders",
 *   ["col1", "col2", "col3"],
 *   ["col4", "col5", "col6"],
 *   "col1",
 *   "col5",
 *   "EQUALS",
 *   "oneToMany",
 *   50
 * );
 * // data - array of rows where one customer has multiple orders
 */
export function useVirtualPackRows(
  leftTableId,
  rightTableId,
  leftColumnIds,
  rightColumnIds,
  leftKeyColumnId,
  rightKeyColumnId,
  joinPredicate,
  matchType,
  pageSize = 50
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Use useSelector with custom equality to prevent unnecessary re-renders
  const leftColumnNames = useSelector((state) => {
    return leftColumnIds
      .map((id) => selectColumnById(state, id)?.columnName)
      .filter((name) => name);
  }, shallowEqual);

  const rightColumnNames = useSelector((state) => {
    return rightColumnIds
      .map((id) => selectColumnById(state, id)?.columnName)
      .filter((name) => name);
  }, shallowEqual);

  const leftKeyColumn = useSelector(
    (state) => selectColumnById(state, leftKeyColumnId)?.columnName
  );

  const rightKeyColumn = useSelector(
    (state) => selectColumnById(state, rightKeyColumnId)?.columnName
  );

  /**
   * Fetch a specific page of data
   */
  const fetchPage = useCallback(
    async (pageNum = 0, reset = false) => {
      // Don't fetch if we don't have valid inputs
      if (
        !leftTableId ||
        !rightTableId ||
        !leftColumnNames ||
        !rightColumnNames ||
        leftColumnNames.length === 0 ||
        rightColumnNames.length === 0 ||
        !leftKeyColumn ||
        !rightKeyColumn ||
        !joinPredicate ||
        !matchType
      ) {
        setData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const offset = pageNum * pageSize;
        const rows = await getPackVirtualRows(
          leftTableId,
          rightTableId,
          leftColumnNames,
          rightColumnNames,
          leftKeyColumn,
          rightKeyColumn,
          joinPredicate,
          matchType,
          pageSize,
          offset
        );

        setData((prevData) => {
          if (reset || pageNum === 0) {
            return rows;
          }
          // Append new rows to existing rows
          return [...prevData, ...rows];
        });

        // Check if we have more data
        setHasMore(rows.length === pageSize);
        setCurrentPage(pageNum);
      } catch (err) {
        console.error("Error fetching virtual pack rows:", err);
        setError(err);
        if (reset || pageNum === 0) {
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      leftTableId,
      rightTableId,
      leftColumnNames,
      rightColumnNames,
      leftKeyColumn,
      rightKeyColumn,
      joinPredicate,
      matchType,
      pageSize,
    ]
  );

  /**
   * Load next page of data
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(currentPage + 1, false);
    }
  }, [fetchPage, currentPage, loading, hasMore]);

  /**
   * Refresh data from first page
   */
  const refresh = useCallback(() => {
    setCurrentPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  /**
   * Reset state to initial values
   */
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

export default useVirtualPackRows;
