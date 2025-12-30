/**
 * @fileoverview useVirtualStackRows Hook
 *
 * A custom React hook for fetching and managing STACK (unioned) table rows from DuckDB.
 * Provides pagination for vertically stacked data from multiple tables with sorting
 * support and infinite scrolling.
 *
 * Features:
 * - Fetch stacked rows from multiple tables (UNION ALL)
 * - Column mapping via database name matrix
 * - Sorting by column index with direction control
 * - Pagination with page-based loading
 * - Infinite scroll with loadMore
 * - Visible range tracking for virtualization
 * - Loading and error states
 *
 * @module hooks/useVirtualStackRows
 *
 * @example
 * const { data, loading, hasMore, loadMore, refresh } = useVirtualStackRows(
 *   ['table-1', 'table-2'],
 *   [['col_a', 'col_b'], ['col_x', 'col_y']],  // column mapping per table
 *   50,       // pageSize
 *   0,        // sortBy column index
 *   'asc'     // sortDirection
 * );
 */

import { useState, useEffect, useCallback } from "react";
import { getTableRows } from "../lib/duckdb/getVirtualStackRows";

/**
 * React hook for fetching and managing stacked table rows from DuckDB.
 *
 * This hook manages the loading state and provides methods to fetch rows from multiple
 * tables stacked vertically using UNION ALL. It handles pagination and sorting,
 * matching the API of usePaginatedTableRows.
 *
 * @param {Array<String>} tableIds - Array of table identifiers to query
 * @param {Array<Array<String|null>>} databaseNameMatrix - 2D array mapping columns for each table
 * @param {number} [pageSize=50] - Number of rows per page
 * @param {number|null} [sortBy=null] - Column index to sort by
 * @param {string} [sortDirection="asc"] - Sort direction
 *
 * @returns {Object} Hook state and methods
 * @returns {Array<Array>} returns.data - Array of row data (appended for pagination)
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {Error|null} returns.error - Error object if query failed
 * @returns {boolean} returns.hasMore - Whether more data is available
 * @returns {number} returns.currentPage - Current page number
 * @returns {Function} returns.loadMore - Load next page of data
 * @returns {Function} returns.refresh - Refresh data from first page
 * @returns {Function} returns.reset - Reset state to initial values
 *
 * @example
 * const { data, loading, error, hasMore, loadMore } = useVirtualStackRows(
 *   ["users", "customers"],
 *   [
 *     ["id", "name",  null    ],
 *     ["id", null,    "email" ]
 *   ],
 *   50,   // pageSize
 *   0,    // sort by first column
 *   "asc"
 * );
 */
export function useVirtualStackRows(
  tableIds,
  databaseNameMatrix,
  pageSize = 50,
  sortBy = null,
  sortDirection = "asc"
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Fetch a specific page of data
   */
  const fetchPage = useCallback(
    async (pageNum = 0, reset = false) => {
      // Don't fetch if we don't have valid inputs
      if (!tableIds || tableIds.length === 0 || !databaseNameMatrix) {
        setData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const offset = pageNum * pageSize;
        const rows = await getTableRows(
          tableIds,
          databaseNameMatrix,
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
        console.error("Error fetching virtual stack rows:", err);
        setError(err);
        if (reset || pageNum === 0) {
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [tableIds, databaseNameMatrix, pageSize, sortBy, sortDirection]
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

export default useVirtualStackRows;
