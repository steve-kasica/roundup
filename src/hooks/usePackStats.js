import { useState, useEffect, useCallback, useMemo } from "react";
import { calcPackStats } from "../lib/duckdb/calcPackStats.js";
import { useSelector } from "react-redux";
import { selectColumnsById } from "../slices/columnsSlice/selectors.js";
import { selectTablesById } from "../slices/tablesSlice/selectors.js";
import { selectOperationsById } from "../slices/operationsSlice/selectors.js";
import { isTableId } from "../slices/tablesSlice/Table.js";
import { MATCH_STATS_DEFAULT } from "../slices/operationsSlice/Operation.js";

/**
 * Custom React Hook for calculating pack statistics using DuckDB
 * This hook provides detailed join statistics including match type counts
 * and cardinality breakdown (one-to-one vs many-to-many).
 *
 * @param {string} leftTableId - The left table identifier for the join
 * @param {string} rightTableId - The right table identifier for the join
 * @param {string} leftColumnName - The left column identifier for the join condition
 * @param {string} rightColumnName - The right column identifier for the join condition
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
  leftColumnId,
  rightColumnId,
  joinType,
  autoFetch = true
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leftColumn, rightColumn] = useSelector((state) =>
    selectColumnsById(state, [leftColumnId, rightColumnId])
  );
  const [leftTable, rightTable] = useSelector((state) => [
    isTableId(leftColumn?.parentId)
      ? selectTablesById(state, leftColumn?.parentId)
      : selectOperationsById(state, leftColumn?.parentId),
    isTableId(rightColumn?.parentId)
      ? selectTablesById(state, rightColumn?.parentId)
      : selectOperationsById(state, rightColumn?.parentId),
  ]);

  const fetchData = useCallback(async () => {
    // Skip calculation if any required parameter is missing
    if (
      !leftTable?.databaseName ||
      !rightTable?.databaseName ||
      !leftColumn?.databaseName ||
      !rightColumn?.databaseName ||
      !joinType
    ) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stats = await calcPackStats(
        leftTable?.databaseName,
        rightTable?.databaseName,
        leftColumn?.databaseName,
        rightColumn?.databaseName,
        joinType
      );
      setData(stats);
    } catch (err) {
      setError(err);
      console.error("Failed to calculate pack statistics:", err);
    } finally {
      setLoading(false);
    }
  }, [
    leftTable?.databaseName,
    rightTable?.databaseName,
    leftColumn?.databaseName,
    rightColumn?.databaseName,
    joinType,
  ]);

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

  const matchKeys = useMemo(() => [...MATCH_STATS_DEFAULT.keys()], []);
  const matchLabels = useMemo(
    () =>
      new Map([
        [matchKeys[0], "Left Only"],
        [matchKeys[1], "Matches"],
        [matchKeys[2], "Right Only"],
      ]),
    [matchKeys]
  );

  return {
    data: data
      ? data
      : Object.fromEntries(
          Array.from(matchLabels.keys()).map((type) => [type, 0])
        ),
    matchLabels,
    matchKeys,
    loading,
    error,
    refetch: fetchData,
    reset,
  };
}

export default usePackStats;
