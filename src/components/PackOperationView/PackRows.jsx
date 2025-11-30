import { useCallback, useMemo, useState } from "react";
import withPackOperationData from "./withPackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import RoundupTable from "../ui/Table/Table.jsx";
/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const PackRows = ({
  // Props passed via withOperationData
  databaseName,
  activeColumnIds, // columnIDs of this operation (not hidden)
  activeChildColumnIds, // column IDs of operation's child tables (not hidden)
  isMaterialized,
  isInSync,
  materializeOperation,
  selectedChildColumnIds,
  // Props passed from withAssociatedAlerts HOC
  errorCount,
  // Props passed directyl from withPackOperationData HOC
  matchStats,
  selectedMatchTypes,
}) => {
  const [sortByColumnId, setSortByColumnId] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const displayColumnIds = useMemo(() => {
    const selectedChildColumnIdsSet = new Set(selectedChildColumnIds.flat());
    const activeIndices = new Set();
    activeChildColumnIds.flat().forEach((colId, index) => {
      if (selectedChildColumnIdsSet.has(colId)) {
        activeIndices.add(index);
      }
    });
    return activeColumnIds.filter((_, index) => activeIndices.has(index));
  }, [activeColumnIds, activeChildColumnIds, selectedChildColumnIds]);

  // TODO: also need to do limit
  const initialOffset = useMemo(() => {
    if (selectedMatchTypes.includes("matchingRowCount")) {
      return 0;
    } else if (selectedMatchTypes.includes("leftUnmatchedRowCount")) {
      return matchStats.matchingRowCount;
    } else if (selectedMatchTypes.includes("rightUnmatchedRowCount")) {
      return matchStats.leftUnmatchedRowCount;
    }
    return null;
  }, [matchStats, selectedMatchTypes]);

  const rowLimit = useMemo(() => {
    const filteredMatchStats = selectedMatchTypes.reduce((acc, type) => {
      return acc + matchStats[type];
    }, 0);
    return filteredMatchStats;
  }, [matchStats, selectedMatchTypes]);

  // const [sortBy, setSortBy] = useState(null);
  // const [sortDirection, setSortDirection] = useState("asc");
  const results = usePaginatedTableRows(
    databaseName,
    displayColumnIds,
    50,
    sortByColumnId,
    sortDirection,
    initialOffset,
    rowLimit
  );
  const { data, loading, error, hasMore, loadMore } = results;

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

  const handleMaterializeView = useCallback(() => {
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
      onMaterializeView={handleMaterializeView}
      sortConfig={{ sortByColumnId, sortDirection }}
      placeHolderColumnLength={11}
      placeHolderRowLength={20}
      initialOffset={initialOffset} // TODO: update row counts
      errorCount={errorCount}
    />
  );
};

PackRows.displayName = "Pack Rows";

const EnhancedPackRows = withPackOperationData(PackRows);

EnhancedPackRows.displayName = "Enhanced Pack Rows";

export { EnhancedPackRows, PackRows };
