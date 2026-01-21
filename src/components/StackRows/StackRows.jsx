/**
 * @fileoverview StackRows Component
 *
 * Displays the result rows of a STACK (union) operation in a virtualized table,
 * combining data from multiple stacked tables. Intelligently handles pagination
 * based on which child tables contain selected columns.
 *
 * Features:
 * - Virtualized table for performance with large datasets
 * - Smart pagination starting from first relevant child table
 * - Column sorting
 * - Row range indicators showing which child table each row comes from
 * - Infinite scroll with automatic loading
 *
 * @module components/StackOperationView/StackRows
 *
 * @example
 * <EnhancedStackRows id="stack-operation-123" />
 */

/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  withOperationData,
  withAssociatedAlerts,
  withStackOperationData,
} from "../HOC";
import { usePaginatedTableRows } from "../../hooks/useTableRowData.js";
import RoundupTable from "../ui/Table/Table.jsx";
import { Stack, Typography } from "@mui/material";
import { NumberIcon } from "../ui/icons/index.js";
import { getSelectedColumnIndices } from "./utilities.js";
import { isTableId } from "../../slices/tablesSlice/Table.js";
import { EnhancedTableLabel } from "../TableView/TableLabel.jsx";
import { EnhancedOperationLabel } from "../OperationView/OperationLabel.jsx";

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
  columnIds,
  childIds,
  childRowCounts,
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
    // Which child  index has the first selected column?
    if (selectedChildColumnIds.flat().length === 0) {
      return [0, 0];
    }
    const [firstIndex, lastIndex] = selectedChildColumnIds.reduce(
      (acc, colIds, index) => {
        if (colIds.length > 0) {
          acc[0] = index < acc[0] ? index : acc[0];
          acc[1] = index > acc[1] ? index : acc[1];
        }
        return acc;
      },
      [Number.MAX_SAFE_INTEGER, -1],
    );

    // Lookup row count of the previous child table to use
    // as the initial offset, or zero if there is no previous child table
    // (i.e., firstSelectedChildIndex is zero).
    return [
      rowRanges.get(childIds[firstIndex]).start,
      rowRanges.get(childIds[lastIndex]).end,
    ];
  }, [childIds, rowRanges, selectedChildColumnIds]);

  const displayColumnIds = useMemo(() => {
    const allSelectedChildColumnIds = selectedChildColumnIds.flat();
    const selectedIndices = getSelectedColumnIndices(
      columnIdMatrix,
      allSelectedChildColumnIds,
    );
    return columnIds.filter((_colId, index) => selectedIndices.has(index));
  }, [columnIds, columnIdMatrix, selectedChildColumnIds]);

  const { data, loading, error, hasMore, loadMore, refresh } =
    usePaginatedTableRows(
      id,
      displayColumnIds,
      pageSize,
      sortByColumnId,
      sortDirection,
      initialOffset,
      rowLimit,
      isMaterialized,
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
    [sortByColumnId, sortDirection],
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
      const tableIndex = [...rowRanges.entries()].findIndex(
        ([, { start, end }]) => globalIndex >= start && globalIndex <= end,
      );
      return (
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <NumberIcon
            number={tableIndex + 1}
            tooltipText={
              isTableId(childIds[tableIndex]) ? (
                <EnhancedTableLabel
                  id={childIds[tableIndex]}
                  includeIcon={false}
                  includeDimensions={false}
                  sx={{ justifyContent: "flex-end" }}
                />
              ) : (
                <EnhancedOperationLabel
                  id={childIds[tableIndex]}
                  includeIcon={false}
                  includeDimensions={false}
                />
              )
            }
          />
          <Typography variant="data-small">{globalIndex + 1}.</Typography>
        </Stack>
      );
    },
    [childIds.length, initialOffset, rowRanges],
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

const EnhancedStackRows = withAssociatedAlerts(
  withOperationData(withStackOperationData(StackRows)),
);

EnhancedStackRows.displayName = "Enhanced Stack Rows";

export { EnhancedStackRows, StackRows };
