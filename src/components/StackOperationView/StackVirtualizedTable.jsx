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
  TableSortLabel,
  Menu,
  IconButton,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useCallback, useRef, useState } from "react";
import {
  EnhancedColumnContextMenuItems,
  EnhancedColumnName,
} from "../ColumnViews";
import withStackOperationData from "./withStackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";

/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
export const StackVirtualizedTable = withStackOperationData(
  ({ operation, selectedOperationColumnIds }) => {
    const tableContainerRef = useRef(null);
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedColumnId, setSelectedColumnId] = useState(null);

    const isMenuOpen = Boolean(menuAnchorEl);

    const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
      operation.id,
      selectedOperationColumnIds,
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

    // Handle column sorting
    const handleColumnSort = useCallback(
      (columnId) => {
        if (sortBy === columnId) {
          // Toggle direction if same column
          setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
          // New column, start with ascending
          setSortBy(columnId);
          setSortDirection("asc");
        }
      },
      [sortBy]
    );

    // Handle context menu
    const handleMenuOpen = useCallback((event, columnId) => {
      event.stopPropagation(); // Prevent sort handler from firing
      setMenuAnchorEl(event.currentTarget);
      setSelectedColumnId(columnId);
    }, []);

    const handleMenuClose = useCallback(() => {
      setMenuAnchorEl(null);
      setSelectedColumnId(null);
    }, []);

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
              {selectedOperationColumnIds.map((colId, index) => (
                <TableCell key={index} align="left">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <TableSortLabel
                      active={sortBy === colId}
                      direction={sortBy === colId ? sortDirection : "asc"}
                      onClick={() => handleColumnSort(colId)}
                      sx={{
                        cursor: "pointer",
                        flex: 1,
                        "& .MuiTableSortLabel-icon": {
                          opacity: sortBy === colId ? 1 : 0.3,
                        },
                        "&:hover .MuiTableSortLabel-icon": {
                          opacity: 0.6,
                        },
                      }}
                    >
                      <EnhancedColumnName id={colId} />
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, colId)}
                      sx={{
                        ml: 1,
                        opacity: 0.6,
                        "&:hover": {
                          opacity: 1,
                        },
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
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
                    length: selectedOperationColumnIds.length + 1,
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
                  colSpan={selectedOperationColumnIds.length + 1}
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
                  colSpan={selectedOperationColumnIds.length + 1}
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

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {selectedColumnId && (
            <EnhancedColumnContextMenuItems
              id={selectedColumnId}
              closeMenu={handleMenuClose}
            />
          )}
        </Menu>
      </TableContainer>
    );
  }
);
