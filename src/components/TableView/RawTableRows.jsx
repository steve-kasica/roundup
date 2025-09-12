import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import withTableData from "../HOC/withTableData";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";

const RawTableRows = withTableData(({ table, activeColumnIds }) => {
  const { data, loading, error } = usePaginatedTableRows(
    table.id,
    activeColumnIds
  );
  return (
    <Box sx={{}}>
      <Typography variant="h6">Row View: {table?.name}</Typography>
      <TableContainer component={Paper} sx={{ height: 300, mt: 1 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
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
                  {activeColumnIds.map((columnId) => (
                    <TableCell key={columnId} sx={{ textAlign: "center" }}>
                      <CircularProgress size={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={activeColumnIds.length}>
                  <Alert severity="error">Error: {error}</Alert>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

export default RawTableRows;
