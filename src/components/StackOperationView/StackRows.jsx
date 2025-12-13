/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import RoundupTable from "../ui/Table/Table.jsx";
import { Stack, Typography } from "@mui/material";

const pageSize = 50; // default page size for pagination

/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const StackRows = ({
  // Props defined via withOperationData
  id,
  materializeOperation,
  isMaterialized,
  isInSync,
  activeColumnIds,
  childIds, // an array of child operation/table IDs
  childRowCounts, // a map of childId to row count
  selectedChildColumnIds,
  selectAllChildColumns,
  // Props defined in withStackOperationData
  columnIdMatrix,
  rowRanges,
  // Props defined in withAssociatedAlerts
  errorCount,
}) => {
  const [sortByColumnId, setSortByColumnId] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [initialOffset, rowLimit] = useMemo(() => {
    // Which child  index has the first selectoed column?
    const [firstIndex, lastIndex] = selectedChildColumnIds.reduce(
      (acc, colIds, index) => {
        if (colIds.length > 0) {
          acc[0] = index < acc[0] ? index : acc[0];
          acc[1] = index > acc[1] ? index : acc[1];
        }
        return acc;
      },
      [Number.MAX_SAFE_INTEGER, -1]
    );

    // Lookup row count of the previous child table to use
    // as the initial offset, or zero if there is no previous child table
    // (i.e., firstSelectedChildIndex is zero).
    const initialOffset = childRowCounts.get(childIds[firstIndex - 1]) || 0;

    // Calculate the total number of rows to display by summing the row counts of all
    // child tables between the first and last selected child table indices.
    const rowLimit = [...childRowCounts.values()].reduce(
      (acc, rowCount, index) => {
        if (index >= firstIndex && index <= lastIndex) {
          acc += rowCount;
        }
        return acc;
      },
      0
    );

    return [initialOffset, rowLimit];
  }, [childIds, childRowCounts, selectedChildColumnIds]);

  const displayColumnIds = useMemo(() => {
    const selectedChildColumnIdsSet = new Set(selectedChildColumnIds.flat());
    const selectedIndices = new Set();
    columnIdMatrix.forEach((columnIds) => {
      columnIds.forEach((colId, colIndex) => {
        if (selectedChildColumnIdsSet.has(colId)) {
          selectedIndices.add(colIndex);
        }
      });
    });
    return activeColumnIds.filter((colId, index) => selectedIndices.has(index));
  }, [activeColumnIds, columnIdMatrix, selectedChildColumnIds]);

  const { data, loading, error, hasMore, loadMore, refresh } =
    usePaginatedTableRows(
      id,
      displayColumnIds,
      pageSize,
      sortByColumnId,
      sortDirection,
      initialOffset,
      rowLimit
    );

  const handleColumnSort = useCallback(
    (event, columnId) => {
      let newDirection = "asc";
      if (sortByColumnId === columnId) {
        newDirection = sortDirection === "asc" ? "desc" : "asc";
      }
      setSortByColumnId(columnId);
      setSortDirection(newDirection);
    },
    [sortByColumnId, sortDirection]
  );

  const handleMaterializeView = useCallback(() => {
    materializeOperation();
    selectAllChildColumns();
  }, [materializeOperation, selectAllChildColumns]);

  const onScrollThreshold = useCallback(() => {
    if (hasMore && !loading && !error) {
      loadMore();
    }
  }, [hasMore, loading, error, loadMore]);

  const setRowMargin = useCallback(
    (rowData, index) => {
      const globalIndex = index + initialOffset; // Zero-indexed
      const tableId = [...rowRanges.entries()].find(([, [start, end]]) => {
        if (globalIndex >= start && globalIndex <= end) {
          return true;
        }
        return false;
      });
      console.log(tableId);
      return (
        <Stack direction="row" alignItems="right">
          {/* <Typography>{tableId[0]}: </Typography> */}
          <Typography>{globalIndex + 1}.</Typography>
        </Stack>
      );
    },
    [initialOffset, rowRanges]
  );

  // Load initial data only when table/columns/sort changes, not when refresh function changes
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, displayColumnIds, sortByColumnId, sortDirection]);

  return (
    <RoundupTable
      columnIds={displayColumnIds}
      isMaterialized={isMaterialized}
      isInSync={isInSync}
      data={data}
      loading={loading}
      error={error}
      onScrollThreshold={onScrollThreshold}
      onColumnSort={handleColumnSort}
      onMaterializeView={handleMaterializeView}
      sortConfig={{ sortByColumnId, sortDirection }}
      placeHolderColumnLength={11}
      placeHolderRowLength={20}
      initialOffset={initialOffset}
      errorCount={errorCount}
      rowMargin={setRowMargin}
    />
  );
};

StackRows.displayName = "Stack Rows";

const EnhancedStackRows = withStackOperationData(StackRows);

EnhancedStackRows.displayName = "Enhanced Stack Rows";

export { EnhancedStackRows, StackRows };
