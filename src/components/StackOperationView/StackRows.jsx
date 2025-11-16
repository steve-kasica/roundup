/* eslint-disable react/prop-types */
import { useCallback, useMemo, useRef, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import RoundupTable from "../ui/Table/Table.jsx";

/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const StackRows = ({
  // Props passed via withOperationData
  id,
  materializeOperation,
  isMaterialized,
  isInSync,
  selectedColumnIds,
  // Props passed directly from withStackoperationData
  columnIdMatrix,
  // Props passed from withAssociatedAlerts
}) => {
  const tableContainerRef = useRef(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
    id,
    null
  );

  // Handle scroll events for infinite loading
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
      if (sortBy === columnId) {
        newDirection = sortDirection === "asc" ? "desc" : "asc";
      }
      setSortBy(columnId);
      setSortDirection(newDirection);
    },
    [sortBy, sortDirection]
  );

  const displayColumns = useMemo(() => {
    return columnIdMatrix[0];
  }, [columnIdMatrix]);

  const handleRefresh = useCallback(() => {
    materializeOperation();
  }, [materializeOperation]);

  return (
    <RoundupTable
      columnIds={selectedColumnIds}
      isMaterialized={isMaterialized}
      isInSync={isInSync}
      data={data}
      loading={loading}
      error={error}
      handleScroll={handleScroll}
      onColumnSort={handleColumnSort}
      sortConfig={{ sortBy, sortDirection }}
      placeHolderColumnLength={11}
      placeHolderRowLength={20}
    />
  );
};

StackRows.displayName = "StackRows";

const EnhancedStackRows = withStackOperationData(StackRows);

EnhancedStackRows.displayName = "EnhancedStackRows";

export { EnhancedStackRows, StackRows };
