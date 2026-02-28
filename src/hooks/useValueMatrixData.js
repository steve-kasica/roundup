/**
 * @fileoverview useValueMatrixData Hook
 *
 * A custom React hook for querying value counts across a matrix of columns. Enables
 * comparison of value distributions across multiple columns from different tables,
 * useful for UpSet plots and column value comparison views.
 *
 * Features:
 * - Fetch value counts for a matrix of column IDs
 * - Multi-table, multi-column comparison
 * - Grouped results by value
 * - Auto-fetch on mount or dependency changes
 * - Manual refetch and reset capabilities
 * - Integration with Redux for table/column/operation metadata
 * - Database name resolution for views
 *
 * @module hooks/useValueMatrixData
 *
 * @example
 * const { data, loading, error, refetch } = useValueMatrixData(
 *   [
 *     [{ tableId: 'table1', columnId: 'col1' }],
 *     [{ tableId: 'table2', columnId: 'colA' }]
 *   ],
 *   true  // autoFetch
 * );
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { getValuesCountMatrix } from "../lib/duckdb";
import { useSelector } from "react-redux";
import { selectColumnsById } from "../slices/columnsSlice";
import { isTableId, selectTablesById } from "../slices/tablesSlice";
import { selectOperationsById } from "../slices/operationsSlice";

/**
 * Custom React Hook for querying value counts for a matrix of column IDs.
 * Each row in the matrix represents a different table, and each cell contains a column ID.
 *
 * @param {Array<Array<{tableId: string, columnId: string}>>} columnMatrix -
 *   A 2D array where each row represents a table and contains objects with tableId and columnId.
 *   Example: [
 *     [{tableId: "table1", columnId: "col1"}, {tableId: "table1", columnId: "col2"}],
 *     [{tableId: "table2", columnId: "colA"}, {tableId: "table2", columnId: "colB"}]
 *   ]
 * @param {boolean} autoFetch - Whether to automatically fetch data when hook mounts or dependencies change (default: true)
 *
 * @returns {Object} Hook state and methods
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {Function} refetch - Function to manually trigger data fetch
 * @returns {Function} reset - Function to reset state to initial values
 *
 * @example
 */
export function useValueMatrixData(columnIds = [], autoFetch = true) {
  const [data, setData] = useState([]);
  const [uniqueValues, setUniqueValues] = useState([]);
  const [valueDegrees, setValueDegrees] = useState([]);
  const [signature, setSignature] = useState([]);
  const [parentIds, setParentIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const columns = useSelector((state) => selectColumnsById(state, columnIds));
  const { tableIds, operationIds } = useMemo(() => {
    const tableIds = [];
    const operationIds = [];
    const uniqParentIds = Array.from(
      new Set(columns.map((col) => col.parentId)),
    );
    setParentIds(uniqParentIds);
    uniqParentIds.forEach((parentId) => {
      if (isTableId(parentId)) {
        tableIds.push(parentId);
      } else {
        operationIds.push(parentId);
      }
    });
    return { tableIds, operationIds };
  }, [columns]);

  const tables = useSelector((state) => selectTablesById(state, tableIds));
  const operations = useSelector((state) =>
    selectOperationsById(state, operationIds),
  );

  const databaseNames = useMemo(() => {
    const id2DatabaseName = new Map(
      columns.map((col) => [
        col.id,
        isTableId(col.parentId)
          ? tables.find((tbl) => tbl.id === col.parentId)?.databaseName
          : operations.find((op) => op.id === col.parentId)
              ?.outputTableDatabaseName,
      ]),
    );
    return columns.map((column) => ({
      table: id2DatabaseName.get(column.id),
      column: column.databaseName,
    }));
  }, [columns, tables, operations]);

  const fetchData = useCallback(async () => {
    // Return early if matrix is empty or invalid
    if (!columnIds || columnIds.length === 0) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const valueCountMatrix = await getValuesCountMatrix(
        databaseNames.map((col) => col.column),
        databaseNames.map((col) => col.table),
      );
      setUniqueValues(valueCountMatrix.map((row) => row[0]));
      setValueDegrees(valueCountMatrix.map((row) => row[row.length - 2])); // Store the degrees of each value
      setSignature(valueCountMatrix.map((row) => row[row.length - 1])); // Store the signature of each value
      setData(valueCountMatrix.map((row) => row.slice(1, -2))); // Do not include the first and last columns (value and degree)
    } catch (err) {
      setError(err);
      console.error("Failed to fetch value matrix data:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [columnIds, databaseNames]);

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
    uniqueValues,
    valueDegrees,
    signature,
    parentIds,
    loading,
    error,
    refetch: fetchData,
    reset,
  };
}
