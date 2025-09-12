import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import withTableData from "../HOC/withTableData";
import { useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import TableViewContainer from "./TableViewContainer";
import ColumnTableHeader from "../ColumnViews/ColumnTableHeader";

const RawTableRows = withTableData(
  ({ table, activeColumnIds, selectedColumnIds, selectColumns }) => {
    const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
      table.id,
      activeColumnIds
    );

    const tableContainerRef = useRef(null);

    const handleScroll = useCallback(
      (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // Trigger 100px before bottom

        if (isNearBottom && hasMore && !loading) {
          loadMore();
        }
      },
      [hasMore, loading, loadMore]
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
    {
      /* TODO: users may never be able to scroll to the bottom of the table, but this makes the
      table sufficiently long so that resize the parent pane doesn't case issues */
    }
    return (
      <TableContainer
        component={Paper}
        sx={{ height: "300px", mt: 1, overflow: "auto" }}
        ref={tableContainerRef}
        onScroll={handleScroll}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "background.paper" }}>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  backgroundColor: "background.paper",
                  zIndex: 3,
                  width: "30px",
                  borderRight: "1px solid",
                  borderColor: "divider",
                }}
              >
                #
              </TableCell>
              {activeColumnIds.map((columnId) => (
                <ColumnTableHeader
                  key={columnId}
                  id={columnId}
                  isSelected={selectedColumnIds.includes(columnId)}
                  onClickHandler={(event) => handleColumnClick(event, columnId)}
                >
                  <ColumnHeader id={columnId} />
                </ColumnTableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                  }}
                >
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "background.paper",
                      zIndex: 1,
                      width: "30px",
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {idx + 1}
                  </TableCell>
                  {activeColumnIds.map((columnId) => (
                    <TableCell key={columnId} sx={{ textAlign: "center" }}>
                      <CircularProgress size={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "background.paper",
                    zIndex: 1,
                    width: "30px",
                    borderRight: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  -
                </TableCell>
                <TableCell colSpan={activeColumnIds.length}>
                  <Alert severity="error">Error: {error}</Alert>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {data.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      backgroundColor: rowIndex % 2 === 0 ? "#f9f9f9" : "white",
                    }}
                  >
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        backgroundColor: "inherit",
                        zIndex: 1,
                        borderRight: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {rowIndex + 1}
                    </TableCell>
                    {row.map((value, colIndex) => (
                      <TableCell key={colIndex}>
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
                  <TableRow>
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        backgroundColor: "background.paper",
                        zIndex: 1,
                        borderRight: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      -
                    </TableCell>
                    <TableCell
                      colSpan={activeColumnIds.length}
                      sx={{ textAlign: "center", py: 2 }}
                    >
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Loading more rows...
                      </Typography>
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
