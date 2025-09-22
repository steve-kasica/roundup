import { useState, useEffect, useCallback } from "react";
import { getMatchValues } from "../lib/duckdb/getMatchValues";

/**
 * Custom hook for fetching match values between two tables
 * @param {string} leftTableId - ID of the left table
 * @param {string} rightTableId - ID of the right table
 * @param {string} leftColumnId - ID of the left column
 * @param {string} rightColumnId - ID of the right column
 * @param {string} joinPredicate - Join predicate (EQUALS, CONTAINS, STARTS_WITH, ENDS_WITH)
 * @param {string} matchType - Type of match (MATCHES, LEFT_UNJOINED, RIGHT_UNJOINED)
 * @param {object} options - Additional options
 * @param {number} options.limit - Number of records to fetch (default: 100)
 * @param {string} options.order - Column to order by (default: "total_count")
 * @param {string} options.orderDirection - Order direction (default: "DESC")
 * @param {boolean} options.enabled - Whether to execute the query (default: true)
 * @returns {object} Query state and control functions
 */
export function useMatchValues(
  leftTableId,
  rightTableId,
  leftColumnId,
  rightColumnId,
  joinPredicate,
  matchType,
  options = {}
) {
  const {
    limit = 100,
    order = "total_count",
    orderDirection = "DESC",
    enabled = true,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeQuery = useCallback(async () => {
    // Skip execution if disabled or missing required parameters
    if (
      !enabled ||
      !leftTableId ||
      !rightTableId ||
      !leftColumnId ||
      !rightColumnId ||
      !joinPredicate ||
      !matchType
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getMatchValues(
        leftTableId,
        rightTableId,
        leftColumnId,
        rightColumnId,
        joinPredicate,
        matchType,
        limit,
        order,
        orderDirection
      );
      setData(result);
    } catch (err) {
      console.error("Error fetching match values:", err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    leftTableId,
    rightTableId,
    leftColumnId,
    rightColumnId,
    joinPredicate,
    matchType,
    limit,
    order,
    orderDirection,
  ]);

  // Execute query when parameters change
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  // Manual refetch function
  const refetch = useCallback(() => {
    executeQuery();
  }, [executeQuery]);

  // Reset function to clear data and error
  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
    // Computed values
    hasData: data.length > 0,
    isEmpty: !loading && data.length === 0 && !error,
  };
}

export default useMatchValues;
