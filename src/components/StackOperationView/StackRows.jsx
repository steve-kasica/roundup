/* eslint-disable react/prop-types */
import { useCallback, useMemo, useRef, useState } from "react";
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
  databaseName,
  materializeOperation,
  isMaterialized,
  isInSync,
  activeColumnIds,
  childIds, // an array of child operation/table IDs
  childRowCounts, // a map of childId to row count
  selectedChildColumnIds,
  // Props defined in withStackOperationData
  columnIdMatrix,
  // Props defined in withAssociatedAlerts
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

  console.log({ initialOffset, displayColumnIds });

  const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
    databaseName,
    displayColumnIds,
    pageSize,
    sortByColumnId,
    sortDirection,
    initialOffset
  );

  // Handle scroll events for infinite loading
  // TODO: does this need to be in RoundupTable
  // to not be repeated?
  const handleScroll = useCallback(
    (event) => {
      const container = event.target;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if user has scrolled near the bottom (within 100px)
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (nearBottom && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore]
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

  const handleRefresh = useCallback(() => {
    materializeOperation();
  }, [materializeOperation]);

  return (
    <RoundupTable
      columnIds={displayColumnIds}
      isMaterialized={isMaterialized}
      isInSync={isInSync}
      data={data}
      loading={loading}
      error={error}
      handleScroll={handleScroll}
      onColumnSort={handleColumnSort}
      sortConfig={{ sortByColumnId, sortDirection }}
      placeHolderColumnLength={11}
      placeHolderRowLength={20}
    />
  );
};

StackRows.displayName = "StackRows";

const EnhancedStackRows = withStackOperationData(StackRows);

EnhancedStackRows.displayName = "EnhancedStackRows";

export { EnhancedStackRows, StackRows };
