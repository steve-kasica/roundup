import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import withTableData from "../HOC/withTableData";
import { useRef, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import ColumnTableHeader from "../ColumnViews/ColumnTableHeader";
import TableBody from "./TableBody.jsx";
import TableHead from "./TableHead.jsx";
import { COLUMN_WIDTHS } from "./index.js";

const RawTableRows = withTableData(
  ({
    table,
    activeColumnIds,
    selectedColumnIds,
    selectColumns,
    showTableHead = true,
    onScrollContainerRef,
    onScroll,
    allowExternalScrollSync = false,
  }) => {
    const selectedColumnIndices = activeColumnIds.map((colId) =>
      selectedColumnIds.includes(colId) ? true : false
    );
    // const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
    //   table.id,
    //   activeColumnIds
    // );

    const tableContainerRef = useRef(null);

    // Notify parent of scroll container ref when it changes
    useEffect(() => {
      if (onScrollContainerRef && tableContainerRef.current) {
        onScrollContainerRef(tableContainerRef.current);
      }
    }, [onScrollContainerRef]);

    // const handleScroll = useCallback(
    //   (event) => {
    //     const { scrollTop, scrollHeight, clientHeight, scrollLeft } =
    //       event.target;
    //     const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    //     // Handle lazy loading
    //     if (isNearBottom && hasMore && !loading) {
    //       loadMore();
    //     }

    //     // Notify parent for scroll synchronization
    //     if (onScroll && allowExternalScrollSync) {
    //       onScroll(scrollLeft, scrollTop);
    //     }
    //   },
    //   [hasMore, loading, loadMore, onScroll, allowExternalScrollSync]
    // );

    const handleColumnClick = useCallback(
      (event, columnId) => {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;

        if (isShift && selectedColumnIds.length > 0) {
          // Shift click: select range from last selected column to current column
          const currentIndex = activeColumnIds.indexOf(columnId);
          const lastSelectedIndex = activeColumnIds.indexOf(
            selectedColumnIds[selectedColumnIds.length - 1]
          );

          const startIndex = Math.min(currentIndex, lastSelectedIndex);
          const endIndex = Math.max(currentIndex, lastSelectedIndex);

          const rangeSelection = activeColumnIds.slice(
            startIndex,
            endIndex + 1
          );

          // Combine existing selection with range selection
          const newSelection = [
            ...new Set([...selectedColumnIds, ...rangeSelection]),
          ];
          selectColumns(newSelection);
        } else if (isCtrlOrCmd) {
          // Ctrl/Cmd click: toggle column selection
          if (selectedColumnIds.includes(columnId)) {
            selectColumns(selectedColumnIds.filter((id) => id !== columnId));
          } else {
            selectColumns([...selectedColumnIds, columnId]);
          }
        } else {
          // Normal click: select only this column
          selectColumns([columnId]);
        }
      },
      [activeColumnIds, selectedColumnIds, selectColumns]
    );
    {
      /* TODO: users may never be able to scroll to the bottom of the table, but this makes the
      table sufficiently long so that resize the parent pane doesn't case issues */
    }
    return (
      <Box
        sx={{ overflow: "hidden", width: "100%" }}
        ref={tableContainerRef}
        // onScroll={handleScroll}
      >
        {showTableHead && (
          <TableHead
            activeColumnIds={activeColumnIds}
            selectedColumnIds={selectedColumnIds}
            handleColumnClick={handleColumnClick}
          />
        )}
        <TableBody
          id={table.id}
          selectedColumnIndices={selectedColumnIndices}
        />
      </Box>
    );
  }
);

export default RawTableRows;
