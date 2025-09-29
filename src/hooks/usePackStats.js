import { useState, useEffect, useCallback } from "react";
import { calcPackStats } from "../lib/duckdb/calcPackStats.js";

/**
 * Custom React Hook for calculating pack statistics using DuckDB
 * This hook provides detailed join statistics including match type counts
 * and cardinality breakdown (one-to-one vs many-to-many).
 *
 * @param {string} leftTableId - The left table identifier for the join
 * @param {string} rightTableId - The right table identifier for the join
 * @param {string} leftColumnId - The left column identifier for the join condition
 * @param {string} rightColumnId - The right column identifier for the join condition
 * @param {string} joinType - The type of join ('EQUALS', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH')
 * @param {boolean} autoFetch - Whether to automatically fetch data when hook mounts or dependencies change (default: true)
 *
 * @returns {Object} Hook state and methods
 * @returns {Object|null} data - The pack statistics object with the following properties:
 *   - left_unjoined: Number of left table rows that didn't match
 *   - right_unjoined: Number of right table rows that didn't match
 *   - one_to_one_matches: Number of one-to-one matches
 *   - many_to_many_matches: Number of many-to-many matches
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if calculation failed
 * @returns {Function} refetch - Function to manually trigger data fetch
 * @returns {Function} reset - Function to reset state to initial values
 */
export function usePackStats(
  leftTableId,
  rightTableId,
  leftColumnId,
  rightColumnId,
  joinType,
  autoFetch = true
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // Skip calculation if any required parameter is missing
    if (
      !leftTableId ||
      !rightTableId ||
      !leftColumnId ||
      !rightColumnId ||
      !joinType
    ) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stats = await calcPackStats(
        leftTableId,
        rightTableId,
        leftColumnId,
        rightColumnId,
        joinType
      );
      setData(stats);
    } catch (err) {
      setError(err);
      console.error("Failed to calculate pack statistics:", err);
    } finally {
      setLoading(false);
    }
  }, [leftTableId, rightTableId, leftColumnId, rightColumnId, joinType]);

  const reset = useCallback(() => {
    setData(null);
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

export default usePackStats;
