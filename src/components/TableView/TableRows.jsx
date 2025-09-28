/* eslint-disable react/prop-types */
import withTableData from "./withTableData.jsx";
import { useRef, useCallback, useEffect, useState } from "react";
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
  TableSortLabel,
} from "@mui/material";
import ColumnHeader from "../ColumnViews/ColumnHeader.jsx";
import { usePaginatedTableRows } from "../../hooks/index.js";

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
const StyledHoverableTableCell = styled(TableCell)(
  ({ isHovered, isEven, maxWidth = "200px" }) => ({
    backgroundColor:
      isHovered && isEven
        ? "#e3f2fd"
        : isHovered && !isEven
        ? "#bbdefb"
        : "transparent",
    transition: "background-color 0.1s ease",
    maxWidth: maxWidth, // Dynamic maximum column width
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  })
);

// Sticky row number cell that stays fixed during horizontal scroll
const StyledStickyRowNumberCell = styled(TableCell)(() => ({
  position: "sticky",
  left: 0,
  maxWidth: "10px",
  backgroundColor: "inherit",
  textAlign: "right",
  color: "#888",
  zIndex: 1,
  borderRight: "1px solid rgba(224, 224, 224, 1)",
}));

// Styled sortable header cell
const StyledSortableHeaderCell = styled(TableCell)(
  ({ isHovered, maxWidth = "200px" }) => ({
    cursor: "pointer",
    backgroundColor: isHovered ? "#bbdefb" : "#f5f5f5",
    transition: "background-color 0.1s ease",
    maxWidth: maxWidth, // Dynamic maximum column width
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    "&:hover": {
      backgroundColor: "#bbdefb",
    },
  })
);

const TableRows = ({
  table,
  selectedColumnIds,
  hoveredIndex = 0,
  hoverColumn,
  unhoverColumn,
  onScrollContainerRef = null,
  onScroll = null,
  showHeader = true,
  columnWidths = {}, // Optional prop for custom column widths
}) => {
  const tableContainerRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({
    columnId: null,
    direction: null, // 'asc', 'desc', or null
  });

  const { data, loading, error, hasMore, loadMore, refresh } =
    usePaginatedTableRows(
      table.id,
      selectedColumnIds,
      50, // pageSize
      sortConfig.columnId, // sortBy
      sortConfig.direction // sortDirection
    );

  const handleSort = useCallback((columnId) => {
    setSortConfig((prev) => {
      if (prev.columnId === columnId) {
        // Cycle through: asc -> desc -> none -> asc
        if (prev.direction === "asc") {
          return { columnId, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { columnId: null, direction: null };
        }
      }
      // First click or different column
      return { columnId, direction: "asc" };
    });
  }, []);

  // Register this table container with parent
  useEffect(() => {
    if (tableContainerRef.current && onScrollContainerRef) {
      onScrollContainerRef(tableContainerRef.current);
    }
  }, [onScrollContainerRef]);

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

  return (
    <TableContainer
      ref={tableContainerRef}
      onScroll={handleScroll}
      sx={{ height: "100%", overflow: "auto" }}
    >
      <Table size="small" stickyHeader sx={{ width: "auto" }}>
        {showHeader && (
          <TableHead>
            <TableRow>
              <StyledStickyRowNumberCell
                sx={{ zIndex: 3, backgroundColor: "#f5f5f5" }}
              >
                #
              </StyledStickyRowNumberCell>
              {selectedColumnIds.map((colId, i) => (
                <StyledSortableHeaderCell
                  key={colId}
                  align="center"
                  sx={{ p: 1 }}
                  isHovered={hoveredIndex === i}
                  maxWidth={columnWidths[colId] || "200px"}
                  onMouseEnter={() => hoverColumn(colId)}
                  onMouseLeave={unhoverColumn}
                  onClick={() => handleSort(colId)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <ColumnHeader key={colId} id={colId} />
                    <TableSortLabel
                      active={sortConfig.columnId === colId}
                      direction={
                        sortConfig.columnId === colId
                          ? sortConfig.direction || "asc"
                          : "asc"
                      }
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </StyledSortableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
        )}
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
                  Error loading table data: {error?.message || "Unknown error"}
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
                {selectedColumnIds.map((colId, i) => (
                  <StyledHoverableTableCell
                    key={colId}
                    align="center"
                    isHovered={hoveredIndex === i}
                    isEven={rowIndex % 2 === 0}
                    maxWidth={columnWidths[colId] || "200px"}
                  >
                    <CircularProgress size={16} />
                  </StyledHoverableTableCell>
                ))}
              </StyledAlternatingTableRow>
            ))
          ) : (
            // Show actual data (now sorted)
            <>
              {data.map((row, rowIndex) => (
                <StyledAlternatingTableRow
                  key={rowIndex}
                  isEven={rowIndex % 2 === 0}
                >
                  <StyledStickyRowNumberCell>
                    {rowIndex + 1}
                  </StyledStickyRowNumberCell>
                  {row.map((value, i) => (
                    <StyledHoverableTableCell
                      key={selectedColumnIds[i]}
                      isHovered={hoveredIndex === i}
                      isEven={rowIndex % 2 === 0}
                      maxWidth={columnWidths[selectedColumnIds[i]] || "200px"}
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
};

TableRows.displayName = "TableRows";

const EnhancedTableRows = withTableData(TableRows);

export { EnhancedTableRows as TableRows };
