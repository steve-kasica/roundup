import { useCallback } from "react";
import PropTypes from "prop-types";
import ColumnHeader from "./ColumnHeader";
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
import { formatNumber } from "../../../lib/utilities";
import withPaginatedRows from "../../HOC/withPaginatedRows";

const LowLevelView = ({
  table,
  operation,
  columnIds: activeColumnIds,
  onClose,
  // Props from withPaginatedRows HOC
  rows,
  rowsExplored,
  loading,
  hasMore,
  error,
  tableContainerRef,
  // Add sorting props
  onRefresh,
  sortBy,
  sortDirection,
}) => {
  const handleSort = useCallback(
    (columnName, direction) => {
      // Call onRefresh with sorting parameters
      onRefresh({
        sortBy: columnName,
        sortDirection: direction,
      });
    },
    [onRefresh]
  );

  const rowCount = table?.rowCount || operation?.rowCount || 0;
  const name = table?.name || operation?.name || "View";

  const explorationPercentage =
    rowCount > 0 ? Math.round((rowsExplored / rowCount) * 100) : 0;

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
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
          flexShrink: 0, // Prevent shrinking
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
              label={`${formatNumber(rowCount)} rows × ${
                activeColumnIds.length
              } columns`}
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
          flex: 1, // Takes all remaining space
          minHeight: 0, // Allows flex child to shrink below content size
          overflow: "auto", // Enables scrolling
          height: "inherit",

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
        <Table
          stickyHeader
          size="small"
          sx={{
            minWidth: 325, // Reduced from 650 to half
            tableLayout: "fixed", // Enforces consistent column widths
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: "grey.50",
                  width: 30, // Reduced from 60 to half
                  minWidth: 30,
                  maxWidth: 30,
                  position: "sticky",
                  left: 0,
                  zIndex: 100,
                  padding: "4px 8px", // Reduced padding
                  fontSize: "0.75rem", // Smaller font
                }}
              >
                #
              </TableCell>
              {activeColumnIds.map((id, i) => (
                <ColumnHeader
                  key={i}
                  index={i}
                  id={id}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  sx={{
                    width: 60, // Half of previous ~120px
                    minWidth: 60,
                    maxWidth: 60,
                    padding: "4px 6px", // Reduced padding
                  }}
                />
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
                        width: 30,
                        minWidth: 30,
                        maxWidth: 30,
                        padding: "4px 8px", // Reduced padding
                        fontSize: "0.75rem", // Smaller font
                        textAlign: "center",
                      }}
                    >
                      {rowIndex + 1}
                    </TableCell>
                    {row.map((cell, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        sx={{
                          width: 60, // Half of previous 120px
                          minWidth: 60,
                          maxWidth: 60, // Reduced from 200 to 100
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          padding: "4px 6px", // Reduced padding
                          fontSize: "0.8rem", // Slightly smaller font
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
          p: "1px",
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0, // Prevent shrinking
          height: "2px", // Fixed height for footer
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
};

LowLevelView.propTypes = {
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
  columnIds: PropTypes.arrayOf(
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
  onRefresh: PropTypes.func,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf(["asc", "desc"]),
};

// Export the enhanced component with pagination
const EnhancedLowLevelView = withPaginatedRows(LowLevelView, {
  pageSize: 25,
  scrollThreshold: 100,
});

EnhancedLowLevelView.displayName = "EnhancedLowLevelView";

export default EnhancedLowLevelView;
