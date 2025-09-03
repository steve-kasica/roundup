/**
 * Example of using the withPaginatedRows HOC with TableView
 */
import { useEffect, useState, useCallback } from "react";
// import ColumnHeader from "./ColumnHeader";
import PropTypes from "prop-types";
import { summarizeTable } from "../../lib/duckdb";
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
import CloseIcon from "@mui/icons-material/Close";
import { formatNumber } from "../../lib/utilities";
import withPaginatedRows from "../HOC/withPaginatedRows";
import withTableData from "../HOC/withTableData";

function TableView({
  table,
  operation,
  activeColumnIds,
  onClose,
  // Props from withPaginatedRows HOC
  rows,
  rowsExplored,
  loading,
  hasMore,
  error,
  tableContainerRef,
}) {
  const id = table?.id || operation?.id;
  const rowCount = table?.rowCount || operation?.rowCount || 0;
  const name = table?.name || operation?.name || "View";

  const [columns, setColumns] = useState([]);

  const fetchColumns = useCallback(async () => {
    const columns = await summarizeTable(id, activeColumnIds);
    setColumns(columns);
  }, [id, activeColumnIds]);

  useEffect(() => {
    // Fetch columns when component mounts
    fetchColumns();
  }, [id, fetchColumns]);

  const explorationPercentage =
    rowCount > 0 ? Math.round((rowsExplored / rowCount) * 100) : 0;

  return (
    <Box
      sx={{
        position: "relative",
        height: "400px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h6" component="h2" sx={{ mb: 0.5 }}>
            {name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={`${formatNumber(rowCount)} rows × ${columns.length} cols`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${formatNumber(
                rowsExplored
              )} explored (${explorationPercentage}%)`}
              size="small"
              color={explorationPercentage === 100 ? "success" : "primary"}
              variant="outlined"
            />
          </Box>
        </Box>
        {onClose && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ m: 2, flexShrink: 0 }}>
          Error loading data: {error.message}
        </Alert>
      )}

      {/* Table Container */}
      <TableContainer
        component={Paper}
        elevation={0}
        ref={tableContainerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: 8,
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "grey.100",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "grey.400",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "grey.600",
          },
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: "grey.50",
                  minWidth: 60,
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                }}
              >
                #
              </TableCell>
              {columns.map((column, i) => (
                <TableCell
                  key={i}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: "grey.50",
                    minWidth: 120,
                    whiteSpace: "nowrap",
                  }}
                >
                  {column?.column_name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0
              ? rows.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: "action.hover",
                      },
                      "&:hover": {
                        backgroundColor: "action.selected",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "text.secondary",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "inherit",
                        zIndex: 1,
                      }}
                    >
                      {rowIndex + 1}
                    </TableCell>
                    {row.map((cell, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={String(cell)} // Show full content on hover
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Status */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
          minHeight: 60,
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Loading more data...
            </Typography>
          </Box>
        )}
        {!hasMore && rows.length > 0 && !loading && (
          <Typography variant="body2" color="text.secondary">
            All data loaded
          </Typography>
        )}
        {!loading && rows.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        )}
      </Box>
    </Box>
  );
}

TableView.propTypes = {
  table: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rowCount: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
  operation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rowCount: PropTypes.number,
    name: PropTypes.string,
  }),
  activeColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  onClose: PropTypes.func,
  // Props from withPaginatedRows HOC
  rows: PropTypes.array,
  rowsExplored: PropTypes.number,
  loading: PropTypes.bool,
  hasMore: PropTypes.bool,
  error: PropTypes.object,
  tableContainerRef: PropTypes.object,
};

// Export the enhanced component with pagination
const EnhancedTableView = withPaginatedRows(TableView, {
  pageSize: 25,
  scrollThreshold: 100,
});

EnhancedTableView.displayName = "EnhancedTableView";

const TableMetadata = ({ table, activeColumnIds }) => {
  return <EnhancedTableView id={table.id} columnIds={activeColumnIds} />;
};

TableMetadata.propTypes = {
  table: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  activeColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
};
const EnhancedTableMetadata = withTableData(TableMetadata);

EnhancedTableMetadata.displayName = "EnhancedTableMetadata";

export default EnhancedTableMetadata;
