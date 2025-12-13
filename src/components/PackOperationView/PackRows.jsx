import { useCallback, useEffect, useMemo, useState } from "react";
import withPackOperationData from "./withPackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import RoundupTable from "../ui/Table/Table.jsx";
import VennDiagram from "../ui/icons/VennDiagram";
import {
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
} from "../../slices/operationsSlice/Operation.js";
import { Stack, Typography } from "@mui/material";

const pageSize = 50;
/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const PackRows = ({
  // Props passed via withOperationData
  id,
  columnIds, // ColumnIDs of this operation
  isMaterialized,
  isLoading,
  isInSync,
  materializeOperation,
  selectedChildColumnIds,
  // Props passed from withAssociatedAlerts HOC
  errorCount,
  // Props passed directly from withPackOperationData HOC
  matchStats,
  selectedMatchTypes,
  leftKey,
  leftColumnIds,
  rightKey,
  rightColumnIds,
}) => {
  const [sortByColumnId, setSortByColumnId] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const displayColumnIds = useMemo(() => {
    if (
      !isMaterialized ||
      leftKey == null ||
      rightKey == null ||
      columnIds.length === 0
    ) {
      return [];
    }
    const leftKeyIndex = leftColumnIds.indexOf(leftKey);
    const rightKeyIndex =
      leftColumnIds.length + rightColumnIds.indexOf(rightKey);

    // Get the key column IDs
    const leftKeyColId = columnIds[leftKeyIndex];
    const rightKeyColId = columnIds[rightKeyIndex];

    const selectedChildColumnIdsSet = new Set(selectedChildColumnIds.flat());
    const selectedParentColumnIds = [...leftColumnIds, ...rightColumnIds]
      .map((colId, index) => {
        return selectedChildColumnIdsSet.has(colId) &&
          ![leftKeyColId, rightKeyColId].includes(colId)
          ? index
          : null;
      })
      .filter(Boolean)
      .map((idx) => columnIds[idx]);

    return selectedParentColumnIds;
  }, [
    columnIds,
    isMaterialized,
    leftColumnIds,
    leftKey,
    rightColumnIds,
    rightKey,
    selectedChildColumnIds,
  ]);

  const initialOffset = useMemo(() => {
    if (selectedMatchTypes.includes(MATCH_TYPE_MATCHES)) {
      return 0;
    } else if (selectedMatchTypes.includes(MATCH_TYPE_LEFT_UNMATCHED)) {
      return matchStats.matches;
    } else if (selectedMatchTypes.includes(MATCH_TYPE_RIGHT_UNMATCHED)) {
      return matchStats.matches + matchStats.left_unmatched;
    }
    return null;
  }, [matchStats, selectedMatchTypes]);

  const rowLimit = useMemo(() => {
    const filteredMatchStats = selectedMatchTypes.reduce((acc, type) => {
      return acc + matchStats[type];
    }, 0);
    return filteredMatchStats;
  }, [matchStats, selectedMatchTypes]);

  const results = usePaginatedTableRows(
    id,
    displayColumnIds,
    pageSize,
    sortByColumnId,
    sortDirection,
    initialOffset,
    rowLimit
  );
  const {
    data,
    minIndex,
    maxIndex,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  } = results;

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

  console.log("PackRows data", {
    data,
    minIndex,
    maxIndex,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  });

  const handleMaterializeView = useCallback(() => {
    materializeOperation();
  }, [materializeOperation]);

  const setRowMargin = useCallback(
    (rowData, index) => {
      const globalIndex = index + initialOffset; // Zero-indexed
      let vennProps = {};
      if (globalIndex < matchStats.matches) {
        // Row is in matches range
        vennProps = {
          leftFill: "#fff",
          overlapFill: "#000",
          rightFill: "#fff",
        };
      } else if (
        globalIndex >= matchStats.matches &&
        globalIndex < matchStats.matches + matchStats.left_unmatched
      ) {
        // Row is in left_unmatched range
        vennProps = {
          leftFill: "#000",
          overlapFill: "#fff",
          rightFill: "#fff",
        };
      } else if (
        globalIndex >=
        matchStats.matches + matchStats.left_unmatched
      ) {
        // Row is in right_unmatched range
        vennProps = {
          leftFill: "#fff",
          overlapFill: "#fff",
          rightFill: "#000",
        };
      } else {
        throw new Error("Index out of bounds");
      }

      return (
        <Stack direction="row" alignItems="right">
          <VennDiagram {...vennProps} />
          <Typography>{globalIndex + 1}.</Typography>
        </Stack>
      );
    },
    [initialOffset, matchStats.left_unmatched, matchStats.matches]
  );

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
      loading={loading || isLoading}
      error={error}
      hasMore={hasMore}
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

PackRows.displayName = "Pack Rows";

const EnhancedPackRows = withPackOperationData(PackRows);

EnhancedPackRows.displayName = "Enhanced Pack Rows";

export { EnhancedPackRows, PackRows };
