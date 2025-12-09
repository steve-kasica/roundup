/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import RoundupTable from "../ui/Table/Table.jsx";

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
  // Props defined in withAssociatedAlerts
  errorCount,
}) => {
  const [sortByColumnId, setSortByColumnId] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const initialOffset = useMemo(() => {
    const firstSelectedChildIndex = selectedChildColumnIds
      .map((columnIds) => columnIds.length === 0)
      .findIndex((isEmpty) => isEmpty);
    const firstSelectedChildId = childIds[firstSelectedChildIndex];
    return childRowCounts.get(firstSelectedChildId) || 0;
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
      initialOffset
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
      // initialOffset={initialOffset} // TODO
      errorCount={errorCount}
    />
  );
};

StackRows.displayName = "Stack Rows";

const EnhancedStackRows = withStackOperationData(StackRows);

EnhancedStackRows.displayName = "Enhanced Stack Rows";

export { EnhancedStackRows, StackRows };
