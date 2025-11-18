import { useRef, useCallback, useMemo, useState } from "react";
import {
  TableBody,
  TableCell,
  TableContainer,
  Typography,
  Table,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  IconButton,
} from "@mui/material";
import { EnhancedColumnHeader } from "../ColumnViews";
import withPackOperationData from "./withPackOperationData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { EnhancedOperationLabel } from "../OperationView/OperationLabel";
import { EnhancedPackOperationLabel } from "./PackOperationLabel";
import { Refresh } from "@mui/icons-material";
import RoundupTable from "../ui/Table/Table.jsx";
/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const PackRows = ({
  // Props passed via withOperationData
  id,
  doesViewExist,
  activeColumnIds,
  isMaterialized,
  isInSync,
  materializeOperation,
  // Props passed from withAssociatedAlerts HOC
  hasAlerts,
  // Props passed directyl from withPackOperationData HOC
  joinPredicate,
  leftTableId,
  leftKey,
  leftSelectedColumns,
  rightTableId,
  rightKey,
  rightSelectedColumns,
  selectedMatchTypes,
}) => {
  const [sortByColumnId, setSortByColumnId] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  // Memoize column arrays to prevent infinite re-renders
  const leftColumnIds = useMemo(
    () => [...leftSelectedColumns],
    [leftSelectedColumns]
  );

  const rightColumnIds = useMemo(
    () => [...rightSelectedColumns],
    [rightSelectedColumns]
  );

  // const [sortBy, setSortBy] = useState(null);
  // const [sortDirection, setSortDirection] = useState("asc");
  const results = usePaginatedTableRows(id, null);
  const { data, loading, error, hasMore, loadMore } = results;
  const tableContainerRef = useRef(null);

  const handleRefresh = useCallback(() => {
    materializeOperation();
  }, [materializeOperation]);

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

  const displayColumnIds = [];

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

PackRows.displayName = "Pack Rows";

const EnhancedPackRows = withPackOperationData(PackRows);

EnhancedPackRows.displayName = "Enhanced Pack Rows";

export { EnhancedPackRows, PackRows };
