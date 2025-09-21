import withTableData from "../HOC/withTableData";
import { useRef, useCallback, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
} from "@mui/material";
import ColumnHeader from "../ColumnViews/ColumnHeader.jsx";
import { usePaginatedTableRows } from "../../hooks/useTableRowData.js";

const RawTableRows = withTableData(
  ({ table, activeColumnIds, selectedColumnIds, selectColumns }) => {
    const selectedColumnIndices = activeColumnIds.map((colId) =>
      selectedColumnIds.includes(colId) ? true : false
    );

    const {
      data,
      loading,
      error,
      hasMore,
      currentPage,
      loadMore,
      refresh,
      reset,
    } = usePaginatedTableRows(table.id, selectedColumnIds);

    const scrollContainersRef = useRef(new Map());
    const isSyncingRef = useRef(false);
    const tableContainerRef = useRef(null);

    const registerScrollContainer = useCallback((childId, scrollElement) => {
      if (scrollElement) {
        scrollContainersRef.current.set(childId, scrollElement);
      } else {
        scrollContainersRef.current.delete(childId);
      }
    }, []);

    const handleScroll = useCallback(
      (event) => {
        const container = event.target;
        const { scrollTop, scrollHeight, clientHeight } = container;

        // Check if user has scrolled near the bottom (within 100px)
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

        if (isNearBottom && hasMore && !loading && !error) {
          loadMore();
        }
      },
      [hasMore, loading, error, loadMore]
    );

    const handleScrollSync = useCallback(
      (sourceChildId, scrollLeft, scrollTop) => {
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;

        // Sync to all other containers
        console.log("StackVirtualTableRows handleScrollSync", {
          scrollContainersRef,
        });
        scrollContainersRef.current.forEach((container, childId) => {
          if (childId !== sourceChildId && container) {
            container.scrollLeft = scrollLeft;
            container.scrollTop = scrollTop;
          }
        });

        // Use setTimeout instead of requestAnimationFrame for more reliable timing
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      },
      []
    );

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

    return (
      <TableContainer
        ref={tableContainerRef}
        onScroll={handleScroll}
        sx={{ maxHeight: "100%", overflow: "auto" }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {selectedColumnIds.map((colId, index) => (
                <TableCell
                  key={colId}
                  align="center"
                  sx={{ p: 1 }}
                  // sx={{
                  //   borderBottom: "1px solid rgba(224, 224, 224, 1)",
                  //   backgroundColor: selectedColumnIndices[index]
                  //     ? "rgba(25, 118, 210, 0.08)"
                  //     : "inherit",
                  //   cursor: "pointer",
                  //   userSelect: "none",
                  //   width: table.columnsById[colId]?.width || "auto",
                  //   minWidth: 50,
                  //   maxWidth: 400,
                  // }}
                >
                  <ColumnHeader key={colId} id={colId} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {error ? (
              <TableRow sx={{ height: "100%" }}>
                <TableCell
                  colSpan={selectedColumnIds.length + 1}
                  sx={{
                    height: "100%",
                    verticalAlign: "middle",
                    padding: 2,
                  }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                    action={
                      <Button color="inherit" size="small" onClick={refresh}>
                        Retry
                      </Button>
                    }
                  >
                    Error loading table data:{" "}
                    {error?.message || "Unknown error"}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : loading && data.length === 0 ? (
              // Show skeleton rows with loading indicators only for initial load
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <TableRow
                  key={`loading-${rowIndex}`}
                  hover
                  sx={{
                    backgroundColor:
                      rowIndex % 2 === 0
                        ? "transparent"
                        : "rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <TableCell>{rowIndex + 1}</TableCell>
                  {selectedColumnIds.map((colId) => (
                    <TableCell key={colId} align="center">
                      <CircularProgress size={16} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Show actual data
              <>
                {data.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    hover
                    sx={{
                      backgroundColor:
                        rowIndex % 2 === 0
                          ? "transparent"
                          : "rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <TableCell>{rowIndex + 1}</TableCell>
                    {row.map((value, cellIndex) => (
                      <TableCell key={activeColumnIds[cellIndex]}>
                        {value === null ? (
                          <Typography
                            color="text.secondary"
                            sx={{ fontStyle: "italic", opacity: 0.6 }}
                          >
                            NULL
                          </Typography>
                        ) : typeof value === "number" ? (
                          value.toLocaleString()
                        ) : (
                          value
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Loading indicator for pagination */}
                {loading && data.length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={selectedColumnIds.length + 1}
                      align="center"
                    >
                      <Box
                        sx={{
                          py: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={20} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Loading more rows...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

export default RawTableRows;
