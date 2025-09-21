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
  styled,
} from "@mui/material";
import ColumnHeader from "../ColumnViews/ColumnHeader.jsx";
import { usePaginatedTableRows } from "../../hooks/useTableRowData.js";

// Row handles alternating colors + row hover
const StyledAlternatingTableRow = styled(TableRow)(({ isEven }) => ({
  backgroundColor: isEven ? "#fff" : "#f5f5f5",
  "&:hover": {
    backgroundColor: isEven ? "#e3f2fd" : "#bbdefb",
  },
  "&:hover td": {
    backgroundColor: "inherit", // Inherit row hover color
  },
  transition: "background-color 0.1s ease",
}));

// Cell only handles column hover (overrides row hover when active)
const StyledHoverableTableCell = styled(TableCell)(({ isHovered, isEven }) => ({
  backgroundColor:
    isHovered && isEven
      ? "#e3f2fd"
      : isHovered && !isEven
      ? "#bbdefb"
      : "transparent",
  transition: "background-color 0.1s ease",
}));

// Sticky row number cell that stays fixed during horizontal scroll
const StyledStickyRowNumberCell = styled(TableCell)(() => ({
  position: "sticky",
  left: 0,
  backgroundColor: "inherit",
  textAlign: "right",
  color: "#888",
  zIndex: 1,
  borderRight: "1px solid rgba(224, 224, 224, 1)",
}));

const RawTableRows = withTableData(
  ({
    table,
    hoveredColumnIds,
    activeColumnIds,
    selectedColumnIds,
    hoverColumn,
    unhoverColumn,
    onScrollContainerRef,
    onScroll,
  }) => {
    const scrollContainersRef = useRef(new Map());
    const isSyncingRef = useRef(false);
    const tableContainerRef = useRef(null);

    const {
      data,
      loading,
      error,
      hasMore,
      // currentPage,
      loadMore,
      refresh,
      // reset,
    } = usePaginatedTableRows(table.id, selectedColumnIds);

    const registerScrollContainer = useCallback((childId, scrollElement) => {
      if (scrollElement) {
        scrollContainersRef.current.set(childId, scrollElement);
      } else {
        scrollContainersRef.current.delete(childId);
      }
    }, []);

    // Register this table container with parent
    useEffect(() => {
      if (tableContainerRef.current && onScrollContainerRef) {
        onScrollContainerRef(tableContainerRef.current);
      }
    }, [onScrollContainerRef]);

    // Sync scroll position from parent
    const syncScroll = useCallback((scrollLeft, scrollTop) => {
      if (tableContainerRef.current && !isSyncingRef.current) {
        isSyncingRef.current = true;
        tableContainerRef.current.scrollLeft = scrollLeft;
        tableContainerRef.current.scrollTop = scrollTop;
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      }
    }, []);

    // // Expose sync function to parent if needed
    // useEffect(() => {
    //   if (onScrollContainerRef) {
    //     onScrollContainerRef(tableContainerRef.current);
    //   }
    // }, [onScrollContainerRef]);

    const handleScroll = useCallback(
      (event) => {
        const container = event.target;
        const { scrollTop, scrollHeight, clientHeight, scrollLeft } = container;

        // Notify parent of scroll position for coordination
        // parent will know which child is the source
        if (onScroll) {
          onScroll(scrollLeft, scrollTop);
        }

        // Check if user has scrolled near the bottom (within 100px)
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

        if (isNearBottom && hasMore && !loading && !error) {
          loadMore();
        }
      },
      [hasMore, loading, error, loadMore, onScroll]
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

    return (
      <TableContainer
        ref={tableContainerRef}
        onScroll={handleScroll}
        sx={{ maxHeight: "100%", overflow: "auto" }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <StyledStickyRowNumberCell
                sx={{ zIndex: 3, backgroundColor: "#f5f5f5" }}
              >
                #
              </StyledStickyRowNumberCell>
              {selectedColumnIds.map((colId) => (
                <TableCell
                  key={colId}
                  align="center"
                  sx={{
                    p: 1,
                    backgroundColor: hoveredColumnIds.includes(colId)
                      ? "#bbdefb"
                      : "#f5f5f5",
                  }}
                  onMouseEnter={() => hoverColumn(colId)}
                  onMouseLeave={unhoverColumn}
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
                <StyledAlternatingTableRow
                  key={`loading-${rowIndex}`}
                  isEven={rowIndex % 2 === 0}
                >
                  <StyledStickyRowNumberCell>
                    {rowIndex + 1}
                  </StyledStickyRowNumberCell>
                  {selectedColumnIds.map((colId) => (
                    <StyledHoverableTableCell
                      key={colId}
                      align="center"
                      isHovered={hoveredColumnIds.includes(colId)}
                      isEven={rowIndex % 2 === 0}
                    >
                      <CircularProgress size={16} />
                    </StyledHoverableTableCell>
                  ))}
                </StyledAlternatingTableRow>
              ))
            ) : (
              // Show actual data
              <>
                {data.map((row, rowIndex) => (
                  <StyledAlternatingTableRow
                    key={rowIndex}
                    isEven={rowIndex % 2 === 0}
                  >
                    <StyledStickyRowNumberCell>
                      {rowIndex + 1}
                    </StyledStickyRowNumberCell>
                    {row.map((value, cellIndex) => (
                      <StyledHoverableTableCell
                        key={activeColumnIds[cellIndex]}
                        isHovered={hoveredColumnIds.includes(
                          activeColumnIds[cellIndex]
                        )}
                        isEven={rowIndex % 2 === 0}
                      >
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
                      </StyledHoverableTableCell>
                    ))}
                  </StyledAlternatingTableRow>
                ))}
                {/* Loading indicator for pagination */}
                {loading && data.length > 0 && (
                  <StyledAlternatingTableRow isEven={data.length % 2 === 0}>
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
                  </StyledAlternatingTableRow>
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
