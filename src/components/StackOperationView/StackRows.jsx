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
  IconButton,
} from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { Refresh } from "@mui/icons-material";
import { EnhancedColumnHeader } from "../ColumnViews";

/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const StackRows = ({
  // Props passed via withOperationData
  id,
  isMaterialized,
  materializeOperation,
  // Props passed directly from withStackoperationData
  columnIdMatrix,
  selectedColumnIds,
  // Props passed from withAssociatedAlerts
  hasAlerts,
}) => {
  const tableContainerRef = useRef(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
    id,
    null
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

  const handleRefresh = useCallback(() => {
    materializeOperation();
  }, [materializeOperation]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
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
        {hasAlerts ? (
          <Alert severity="error" sx={{ mb: 1, height: "100%" }}>
            This stack operation has associated alerts. Please review them.
          </Alert>
        ) : !isMaterialized ? (
          <Alert severity="warning">
            <Typography variant="body2">
              The materialized view for this operation does not exist. Please
              compute the operation to generate the data.
            </Typography>
          </Alert>
        ) : error ? (
          <Alert
            severity="error"
            action={
              <IconButton
                disabled={hasAlerts}
                title="Materialize operation from schema specification"
                onClick={handleRefresh}
              >
                {<Refresh />}
              </IconButton>
            }
          >
            <Typography variant="body2">
              Failed to load table data: {error.message || "Unknown error"}
            </Typography>
          </Alert>
        ) : null}
        <Table size="small" stickyHeader sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {displayColumns.map((columnId, index) => (
                <TableCell key={index} align="left">
                  {/* <EnhancedColumnHeader
                    id={columnId}
                    isActive={sortBy === columnId}
                    // onSort={handleColumnSort}
                    // onMenuClose={handleMenuClose}
                    sortDirection={sortDirection}
                  /> */}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isMaterialized ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <StyledAlternatingTableRow
                    key={`empty-${index}`}
                    isEven={index % 2 === 0}
                  >
                    <StickyTableCell>
                      <Typography
                        variant="body2"
                        color="text.disabled"
                        sx={{ fontStyle: "italic" }}
                      >
                        —
                      </Typography>
                    </StickyTableCell>
                    {displayColumns.map((_, colIndex) => (
                      <TableCell key={colIndex} align="left">
                        <Typography
                          variant="body2"
                          color="text.disabled"
                          sx={{ fontStyle: "italic" }}
                        >
                          —
                        </Typography>
                      </TableCell>
                    ))}
                  </StyledAlternatingTableRow>
                ))}
              </>
            ) : error ? (
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
              ))
            ) : data ? (
              data.map((row, rowIndex) => (
                <StyledAlternatingTableRow
                  key={rowIndex}
                  isEven={rowIndex % 2 === 0}
                >
                  <StickyTableCell width={"10px"}>
                    {rowIndex + 1}
                  </StickyTableCell>
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
              ))
            ) : (
              <Alert severity="error">Error unreachable state</Alert>
            )}
            {/* Loading more indicator */}
            {loading && data.length > 0 ? (
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
            ) : (
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
    </Box>
  );
};

StackRows.displayName = "StackRows";

const EnhancedStackRows = withStackOperationData(StackRows);

EnhancedStackRows.displayName = "EnhancedStackRows";

export { EnhancedStackRows, StackRows };
