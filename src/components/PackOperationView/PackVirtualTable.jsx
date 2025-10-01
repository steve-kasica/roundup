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
import { EnhancedColumnName } from "../ColumnViews";
import withPackOperationData from "./withPackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";

/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const PackVirtualTable = ({ operation, selectedOperationColumnIds }) => {
  const { data, loading, error } = usePaginatedTableRows(
    operation.id,
    selectedOperationColumnIds,
    50
  );

  return (
    <TableContainer
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
      {loading && (
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
          <TableRow>
            <TableCell>#</TableCell>
            {selectedOperationColumnIds.map((colId, index) => (
              <TableCell key={index} align="left">
                <EnhancedColumnName id={colId} />
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
            !loading &&
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
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const EnhancedPackVirtualTable = withPackOperationData(PackVirtualTable);
export { EnhancedPackVirtualTable, PackVirtualTable };
