/**
 * @fileoverview PackRows Component
 *
 * Displays the result rows of a PACK (join) operation in a virtualized table with
 * match statistics visualization. Shows matched, left-unmatched, and right-unmatched
 * rows with interactive filtering based on match type selection.
 *
 * Features:
 * - Virtualized table for performance with large datasets
 * - Match type filtering (matched, left-only, right-only)
 * - Column sorting
 * - Match statistics Venn diagram
 * - Pagination with infinite scroll
 * - Column selection integration
 *
 * @module components/PackOperationView/PackRows
 *
 * @example
 * <EnhancedPackRows id="pack-operation-123" />
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import RoundupTable from "../ui/Table/Table.jsx";
import VennDiagram from "../ui/icons/VennDiagram";
import {
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
} from "../../slices/operationsSlice/Operation.js";
import { Stack, Typography } from "@mui/material";
import {
  withOperationData,
  withPackOperationData,
  withAssociatedAlerts,
  withGlobalInterfaceData,
} from "../HOC";

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
  columnIds,
  isMaterialized,
  isLoading,
  isInSync,
  materializeOperation,
  selectedChildColumnIdsSet,
  selectAllChildColumns,
  // Props passed from withAssociatedAlerts HOC
  errorCount,
  // Props passed directly from withPackOperationData HOC
  matchStats,
  leftKey,
  leftColumnIds,
  rightKey,
  rightColumnIds,
  validMatchGroups,
  // Props passed directly from withGlobalInterfaceData HOC
  selectedMatches,
  selectMatches,
}) => {
  const [sortByColumnId, setSortByColumnId] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleColumnSort = useCallback(
    (_event, columnId) => {
      let newDirection = "asc";
      if (sortByColumnId === columnId) {
        newDirection = sortDirection === "asc" ? "desc" : "asc";
      }
      setSortByColumnId(columnId);
      setSortDirection(newDirection);
    },
    [sortByColumnId, sortDirection]
  );

  /**
   * Get pack operation column IDs to display based on selected child columns
   */
  const displayColumnIds = useMemo(() => {
    if (
      !isMaterialized ||
      leftKey == null ||
      rightKey == null ||
      selectedChildColumnIdsSet.size === 0 ||
      columnIds.length === 0
    ) {
      return [];
    } else {
      const allChildColumns = [...leftColumnIds, ...rightColumnIds];
      const selectedTableIndices = allChildColumns.reduce(
        (acc, colId, index) => {
          if (selectedChildColumnIdsSet.has(colId)) {
            acc.push(index);
          }
          return acc;
        },
        []
      );
      const selectedOperationColumnIds = selectedTableIndices.map(
        (index) => columnIds[index]
      );
      return selectedOperationColumnIds;
    }
  }, [
    columnIds,
    isMaterialized,
    leftColumnIds,
    leftKey,
    rightColumnIds,
    rightKey,
    selectedChildColumnIdsSet,
  ]);

  const initialOffset = useMemo(() => {
    if (selectedMatches.includes(MATCH_TYPE_MATCHES)) {
      return 0;
    } else if (selectedMatches.includes(MATCH_TYPE_LEFT_UNMATCHED)) {
      return matchStats.matches;
    } else if (selectedMatches.includes(MATCH_TYPE_RIGHT_UNMATCHED)) {
      return matchStats.matches + matchStats.left_unmatched;
    }
    return null;
  }, [matchStats, selectedMatches]);

  const rowLimit = useMemo(() => {
    const filteredMatchStats = selectedMatches.reduce((acc, type) => {
      return acc + matchStats[type];
    }, 0);
    return filteredMatchStats;
  }, [matchStats, selectedMatches]);

  const results = usePaginatedTableRows(
    id,
    displayColumnIds,
    pageSize,
    sortByColumnId,
    sortDirection,
    initialOffset,
    rowLimit
  );
  const { data, loading, error, hasMore, loadMore, refresh } = results;

  const handleMaterializeView = useCallback(() => {
    materializeOperation();
    selectAllChildColumns();
    selectMatches(validMatchGroups);
  }, [
    materializeOperation,
    selectAllChildColumns,
    selectMatches,
    validMatchGroups,
  ]);

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
          <Typography variant="data-small">{globalIndex + 1}.</Typography>
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

const EnhancedPackRows = withOperationData(
  withAssociatedAlerts(withPackOperationData(withGlobalInterfaceData(PackRows)))
);

EnhancedPackRows.displayName = "Enhanced Pack Rows";

export { EnhancedPackRows, PackRows };
