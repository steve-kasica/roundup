/* eslint-disable react/prop-types */
import { Alert, CircularProgress, Box, Typography } from "@mui/material";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { COLUMN_WIDTHS } from "./index.js";
import { useCallback, useRef, useEffect } from "react";
import TableCell from "./TableCell.jsx";
import TableRow from "./TableRow.jsx";
import withTableData from "../HOC/withTableData.jsx";

const TableBody = withTableData(
  ({
    table,
    activeColumnIds,
    selectedColumnIndices,
    onScroll,
    onScrollContainerRef,
    allowExternalScrollSync = false,
    sx = {},
  }) => {
    const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
      table.id,
      activeColumnIds
    );

    const scrollContainerRef = useRef(null);
    const previousDataLengthRef = useRef(0);
    const scrollPositionRef = useRef({ scrollTop: 0, scrollLeft: 0 });
    const isExternalScrollRef = useRef(false);

    // Register the scroll container with parent when it changes
    useEffect(() => {
      if (onScrollContainerRef && scrollContainerRef.current) {
        onScrollContainerRef(scrollContainerRef.current);
      }
    }, [onScrollContainerRef]);

    // Preserve scroll position when new data is loaded
    useEffect(() => {
      if (
        data.length > previousDataLengthRef.current &&
        scrollContainerRef.current
      ) {
        // New data was added, restore scroll position
        const { scrollTop, scrollLeft } = scrollPositionRef.current;
        scrollContainerRef.current.scrollTop = scrollTop;
        scrollContainerRef.current.scrollLeft = scrollLeft;
      }
      previousDataLengthRef.current = data.length;
    }, [data.length]);

    const handleScroll = useCallback(
      (event) => {
        const { scrollTop, scrollHeight, clientHeight, scrollLeft } =
          event.target;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

        // Store current scroll position
        scrollPositionRef.current = { scrollTop, scrollLeft };

        // Handle lazy loading
        if (isNearBottom && hasMore && !loading) {
          loadMore();
        }

        // Always notify parent for scroll synchronization (both horizontal and vertical)
        if (onScroll) {
          onScroll(scrollLeft, scrollTop);
        }
      },
      [hasMore, loading, loadMore, onScroll]
    );

    // Handle external scroll updates
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container || !allowExternalScrollSync) return;

      const handleExternalScroll = () => {
        isExternalScrollRef.current = true;
      };

      // Listen for scroll events that might be triggered externally
      container.addEventListener("scroll", handleExternalScroll, {
        passive: true,
      });

      return () => {
        container.removeEventListener("scroll", handleExternalScroll);
      };
    }, [allowExternalScrollSync]);

    const cellSx = {
      padding: "6px 16px",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    };

    const indexCellSx = {
      ...cellSx,
      position: "sticky",
      left: 0,
      backgroundColor: "background.paper",
      zIndex: 1,
      width: COLUMN_WIDTHS.index,
      minWidth: COLUMN_WIDTHS.index,
      maxWidth: COLUMN_WIDTHS.index,
      borderRight: "1px solid",
      borderColor: "divider",
      justifyContent: "center",
    };

    return (
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          height: "100%",
          maxHeight: "100%",
          ...sx,
        }}
      >
        {loading && data.length === 0 ? (
          // Initial loading state
          Array.from({ length: 10 }).map((_, idx) => (
            <TableRow
              key={idx}
              sx={{
                backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                minWidth: "fit-content",
                display: "flex",
                flexWrap: "nowrap",
              }}
            >
              <TableCell>{idx + 1}</TableCell>
              {activeColumnIds.map((columnId) => (
                <TableCell
                  key={columnId}
                  sx={{
                    justifyContent: "center",
                    flexShrink: 0,
                    minWidth: COLUMN_WIDTHS.default || "150px",
                  }}
                >
                  <CircularProgress size={20} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : error ? (
          <Box sx={{ display: "flex" }}>
            <Box
              sx={{
                ...cellSx,
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Alert severity="error">Error: {error}</Alert>
            </Box>
          </Box>
        ) : (
          <>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                index={rowIndex}
                sx={{
                  backgroundColor: rowIndex % 2 === 0 ? "#f9f9f9" : "white",
                  minWidth: "fit-content",
                  display: "flex",
                  flexWrap: "nowrap",
                }}
              >
                <TableCell sx={{ width: "10px", fontSize: "0.875rem" }}>
                  {rowIndex + 1}
                </TableCell>
                {row.map((value, colIndex) => (
                  <TableCell
                    key={colIndex}
                    isSelected={selectedColumnIndices[colIndex]}
                    sx={{
                      userSelect: "none",
                      flexShrink: 0,
                      minWidth: COLUMN_WIDTHS.default || "150px",
                    }}
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
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {loading && hasMore && (
              // Loading more rows indicator
              <Box sx={{ display: "flex", minWidth: "fit-content" }}>
                <Box sx={indexCellSx}>...</Box>
                <TableCell sx={{ flexShrink: 0 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Loading more rows...
                  </Typography>
                </TableCell>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  }
);

export default TableBody;
