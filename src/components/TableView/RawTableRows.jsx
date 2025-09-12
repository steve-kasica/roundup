import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import withTableData from "../HOC/withTableData";
import { useRef, useCallback } from "react";
import {
  Box,
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

const RawTableRows = withTableData(({ table, activeColumnIds }) => {
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

  return (
    <Box>
      <Typography variant="h6">Row View: {table?.name}</Typography>
      {/* TODO: users may never be able to scroll to the bottom of the table, but this makes the 
      table sufficiently long so that resize the parent pane doesn't case issues */}
      <TableContainer
        component={Paper}
        sx={{ height: "300px", mt: 1, overflow: "auto" }}
        ref={tableContainerRef}
        onScroll={handleScroll}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
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
                <TableCell key={columnId}>
                  <ColumnHeader id={columnId} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow key={idx}>
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
                  <TableRow key={rowIndex}>
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
    </Box>
  );
});

export default RawTableRows;
