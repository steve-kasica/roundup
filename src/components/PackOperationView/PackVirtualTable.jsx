/* eslint-disable react/prop-types */
import { useRef, useCallback, useEffect, useState } from "react";
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
import { EnhancedColumnHeader } from "../ColumnViews";
import withPackOperationData from "./withPackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";
import { EnhancedTableLabel } from "../TableView";
/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const PackVirtualTable = ({
  operation,
  selectedOperationColumnIds,
  alerts = [],
}) => {
  const hasAlerts = alerts.length > 0;
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
    operation.id,
    selectedOperationColumnIds,
    50,
    sortBy,
    sortDirection
  );

  const tableContainerRef = useRef(null);

  // Scroll handler for lazy loading
  const handleScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // Trigger load more when scrolled to within 100px of bottom
    const threshold = 100;
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadMore();
    }
  }, [loadMore, loading, hasMore]);

  // Set up scroll listener
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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
      sx={{
        maxHeight: "400px",
        overflowY: "auto",
        border: hasAlerts ? "2px solid" : "none",
        borderColor: hasAlerts ? "error.main" : "transparent",
        borderRadius: hasAlerts ? 1 : 0,
        backgroundColor: hasAlerts ? "error.lighter" : "transparent",
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
        <Alert severity="error">
          <Typography variant="body2">
            Failed to load table data: {error.message || "Unknown error"}
          </Typography>
        </Alert>
      )}
      <Table size="small" stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          {/* First row: Table names */}
          <TableRow>
            <TableCell
              rowSpan={2}
              sx={{
                verticalAlign: "middle",
                backgroundColor: hasAlerts ? "error.lighter" : "inherit",
                color: hasAlerts ? "error.main" : "inherit",
                fontWeight: hasAlerts ? 600 : "inherit",
              }}
            >
              #
            </TableCell>
            {operation?.children?.map((tableId, tableIndex) => {
              // For now, assume equal distribution of columns across tables
              // You may want to pass column-to-table mapping from the parent component
              const columnsPerTable = Math.ceil(
                selectedOperationColumnIds.length / operation.children.length
              );
              const isLastTable = tableIndex === operation.children.length - 1;
              const actualColumnCount = isLastTable
                ? selectedOperationColumnIds.length -
                  tableIndex * columnsPerTable
                : columnsPerTable;

              return actualColumnCount > 0 ? (
                <TableCell
                  key={tableId}
                  colSpan={actualColumnCount}
                  align="center"
                  sx={{
                    borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    fontWeight: "bold",
                    backgroundColor: hasAlerts
                      ? "error.lighter"
                      : "rgba(0, 0, 0, 0.04)",
                    color: hasAlerts ? "error.main" : "inherit",
                  }}
                >
                  <EnhancedTableLabel
                    id={tableId}
                    includeDimensions={false}
                    includeIcon={false}
                    sx={{
                      fontSize: "1rem",
                    }}
                  />
                </TableCell>
              ) : null;
            })}
          </TableRow>
          {/* Second row: Column names */}
          <TableRow>
            {selectedOperationColumnIds.map((colId, index) => (
              <TableCell key={index} align="left">
                <EnhancedColumnHeader
                  id={colId}
                  isActive={sortBy === colId}
                  onSort={handleColumnSort}
                  sortDirection={sortDirection}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {error &&
            Array.from({ length: 10 }).map((_, index) => (
              <StyledAlternatingTableRow key={index} isEven={index % 2 === 0}>
                <TableCell>{index + 1}</TableCell>
                {selectedOperationColumnIds.map((_, colIndex) => (
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
                        cell !== null && cell !== undefined ? String(cell) : ""
                      }
                    >
                      {cell !== null && cell !== undefined ? String(cell) : "—"}
                    </Typography>
                  </TableCell>
                ))}
              </StyledAlternatingTableRow>
            ))}

          {/* Loading indicator for pagination */}
          {loading && data.length > 0 && (
            <TableRow>
              <TableCell
                colSpan={selectedOperationColumnIds.length + 1}
                align="center"
                sx={{ py: 2 }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
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
                colSpan={selectedOperationColumnIds.length + 1}
                align="center"
                sx={{ py: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  All data loaded ({data.length} rows)
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

PackVirtualTable.displayName = "Pack Virtual Table";

const EnhancedPackVirtualTable = withPackOperationData(PackVirtualTable);

EnhancedPackVirtualTable.displayName = "Enhanced Pack Virtual Table";

export { EnhancedPackVirtualTable, PackVirtualTable };
