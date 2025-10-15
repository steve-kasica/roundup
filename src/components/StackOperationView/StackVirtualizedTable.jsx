/* eslint-disable react/prop-types */
import {
  TableBody,
  TableCell,
  TableContainer,
  Typography,
  Table,
  TableHead,
  TableRow,
  Skeleton,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useCallback, useRef, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";
import { EnhancedColumnHeader } from "../ColumnViews";

/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
export const StackVirtualizedTable = withStackOperationData(
  ({ operation, selectedColumnIds, selectedColumnNames }) => {
    const tableContainerRef = useRef(null);
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
      operation.id,
      selectedColumnNames,
      50,
      sortBy,
      sortDirection
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

    return (
      <TableContainer
        ref={tableContainerRef}
        onScroll={handleScroll}
        sx={{
          maxHeight: "400px",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.1)",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "4px",
          },
        }}
      >
        {loading && data.length === 0 && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading table data...
            </Typography>
          </Box>
        )}
        {error && (
          <Alert
            severity="error"
            action={
              <Box>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  Retry
                </Typography>
              </Box>
            }
          >
            <Typography variant="body2">
              Failed to load table data: {error.message || "Unknown error"}
            </Typography>
          </Alert>
        )}
        <Table size="small" stickyHeader sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {selectedColumnIds.map((colId, index) => (
                <TableCell key={index} align="left">
                  <EnhancedColumnHeader
                    id={colId}
                    isActive={sortBy === colId}
                    onSort={handleColumnSort}
                    // onMenuClose={handleMenuClose}
                    sortDirection={sortDirection}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {error &&
              data.length === 0 &&
              Array.from({ length: 5 }).map((_, index) => (
                <StyledAlternatingTableRow key={index} isEven={index % 2 === 0}>
                  {Array.from({
                    length: selectedColumnIds.length + 1,
                  }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </StyledAlternatingTableRow>
              ))}
            {data &&
              !error &&
              data.map((row, rowIndex) => (
                <StyledAlternatingTableRow
                  key={rowIndex}
                  isEven={rowIndex % 2 === 0}
                >
                  <StickyTableCell>{rowIndex + 1}</StickyTableCell>
                  {row.map((cell, colIndex) => (
                    <TableCell key={colIndex} align="left">
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 150,
                        }}
                        title={
                          cell !== null && cell !== undefined
                            ? String(cell)
                            : ""
                        }
                      >
                        {cell !== null && cell !== undefined
                          ? String(cell)
                          : "—"}
                      </Typography>
                    </TableCell>
                  ))}
                </StyledAlternatingTableRow>
              ))}
            {/* Loading more indicator */}
            {loading && data.length > 0 && (
              <TableRow>
                <TableCell
                  colSpan={selectedColumnIds.length + 1}
                  align="center"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                    py={2}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Loading more rows...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {/* End of data indicator */}
            {!loading && !hasMore && data.length > 0 && (
              <TableRow>
                <TableCell
                  colSpan={selectedColumnIds.length + 1}
                  align="center"
                >
                  <Typography variant="body2" color="text.secondary" py={2}>
                    No more data to load
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);
