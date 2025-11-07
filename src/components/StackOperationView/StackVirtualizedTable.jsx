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
  Toolbar,
  IconButton,
} from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";
import useVirtualStackRows from "../../hooks/useVirtualStackRows";
import { transpose } from "d3";
import { Refresh, RunCircle } from "@mui/icons-material";
import { EnhancedColumnHeader } from "../ColumnViews";

/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const StackVirtualizedTable = ({
  operation,
  columnIdMatrix,
  selectedColumnIds,
  selectedChildColumns,
  hasAlerts,
}) => {
  const tableContainerRef = useRef(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // This should update whenever columnIdMatrix changes or
  // the selected columns within a child table changes
  const { selectedChildColumnNameMatrix, childIdToRowIndex } = useMemo(() => {
    let columnNameMatrixWithChildIds = columnIdMatrix.map((columnIds, i) => {
      const childSelectedColumns =
        selectedChildColumns[operation.children[i]] || [];

      const childSelectedColumnIds = childSelectedColumns.map((col) => col.id);
      return {
        childId: operation.children[i],
        columns: columnIds.map((id) => {
          return childSelectedColumnIds.includes(id)
            ? childSelectedColumns.find((col) => col.id === id)?.columnName
            : null;
        }),
      };
    });

    // Remove rows (child tables) where ALL values are null
    columnNameMatrixWithChildIds = columnNameMatrixWithChildIds.filter((row) =>
      row.columns.some((value) => value !== null)
    );

    // Extract just the column arrays for filtering logic
    let columnNameMatrix = columnNameMatrixWithChildIds.map(
      (row) => row.columns
    );

    // Remove columns where ALL values are null
    if (columnNameMatrix.length === 0) {
      return { selectedChildColumnNameMatrix: [], childIdToRowIndex: {} };
    }

    const numColumns = columnNameMatrix[0]?.length || 0;
    const columnsToKeep = [];

    for (let colIndex = 0; colIndex < numColumns; colIndex++) {
      const hasNonNullValue = columnNameMatrix.some(
        (row) => row[colIndex] !== null
      );
      if (hasNonNullValue) {
        columnsToKeep.push(colIndex);
      }
    }

    // Filter out the all-null columns
    const filteredMatrix = columnNameMatrix.map((row) =>
      columnsToKeep.map((colIndex) => row[colIndex])
    );

    // Create mapping from childId to row index in filtered matrix
    const childIdToRowIndex = columnNameMatrixWithChildIds.reduce(
      (map, row, index) => {
        map[index] = row.childId;
        return map;
      },
      Array(filteredMatrix.length).fill(null)
    );

    return {
      selectedChildColumnNameMatrix: filteredMatrix,
      childIdToRowIndex,
    };
  }, [columnIdMatrix, operation.children, selectedChildColumns]);

  const { data, loading, error, hasMore, loadMore } = useVirtualStackRows(
    childIdToRowIndex,
    selectedChildColumnNameMatrix,
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

  const displayColumns = useMemo(() => {
    return columnIdMatrix[0];
  }, [columnIdMatrix]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Stack Operation Preview
        </Typography>
        <IconButton
          disabled={hasAlerts}
          title="Compute table from schema specification"
        >
          <Refresh />
        </IconButton>
      </Toolbar>
      {hasAlerts ? (
        <Alert severity="error" sx={{ mb: 1, height: "100%" }}>
          This stack operation has associated alerts. Please review them.
        </Alert>
      ) : (
        <TableContainer
          ref={tableContainerRef}
          onScroll={handleScroll}
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
                {displayColumns.map((columnId, index) => (
                  <TableCell key={index} align="left">
                    <EnhancedColumnHeader
                      id={columnId}
                      isActive={sortBy === columnId}
                      // onSort={handleColumnSort}
                      // onMenuClose={handleMenuClose}
                      sortDirection={sortDirection}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {error &&
                Array.from({ length: 5 }).map((_, index) => (
                  <StyledAlternatingTableRow
                    key={index}
                    isEven={index % 2 === 0}
                  >
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
      )}
    </Box>
  );
};

StackVirtualizedTable.displayName = "StackVirtualizedTable";

const EnhancedStackVirtualizedTable = withStackOperationData(
  StackVirtualizedTable
);

EnhancedStackVirtualizedTable.displayName = "EnhancedStackVirtualizedTable";

export { EnhancedStackVirtualizedTable, StackVirtualizedTable };
