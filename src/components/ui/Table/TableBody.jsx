import {
  CircularProgress,
  TableBody as MuiTableBody,
  TableCell,
  Typography,
  Box,
} from "@mui/material";
import SkeletonRow from "./SkeletonRow";
import DummyRow from "./DummyRow";
import StyledAlternatingTableRow from "./StyledAlternatingTableRow";
import StyledTableCell from "./StyledTableCell";

const placeholderRowCount = 30;
const maxColumnWidth = 20;

const rowMarginStyle = {
  userSelect: "none",
  backgroundColor: "#f5f5f5",
  textAlign: "right",
  width: "10px",
  padding: 1,
  fontSize: "0.75rem",
  border: "none",
  borderRight: "1px solid rgba(224, 224, 224, 1)",
};

const TableBody = ({
  columnIds,
  loading,
  data,
  error,
  isInSync,
  rowMargin,
  hasMore,
  placeholderColumnCount,
}) => {
  const columnCount = columnIds?.length || placeholderColumnCount;
  const rowCount =
    loading || columnIds.length === 0 ? placeholderRowCount : data.length;
  return (
    <MuiTableBody>
      {columnIds?.length === 0 ? (
        <>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <DummyRow
              key={`no-columns-${rowIndex}`}
              rowIndex={rowIndex}
              columnCount={columnCount}
              rowMarginStyle={rowMarginStyle}
              maxColumnWidth={maxColumnWidth}
            />
          ))}
        </>
      ) : loading && data.length === 0 ? (
        <>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <SkeletonRow
              key={`skeleton-${rowIndex}`}
              rowIndex={rowIndex + 1}
              columnCount={columnCount}
              rowMarginStyle={rowMarginStyle}
              maxColumnWidth={maxColumnWidth}
            />
          ))}
        </>
      ) : error ? (
        /* Error State - Show error message in table body */
        <StyledAlternatingTableRow isEven={true}>
          <TableCell colSpan={columnCount + 1} align="center">
            <Box
              sx={{
                py: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="body1" color="error" sx={{ mb: 1 }}>
                Failed to load table data
              </Typography>
            </Box>
          </TableCell>
        </StyledAlternatingTableRow>
      ) : (
        /* Data Rows - Actual table content with alternating colors and hover effects */
        <>
          {data.map((row, rowIndex) => (
            <StyledAlternatingTableRow
              key={rowIndex}
              isEven={rowIndex % 2 === 0}
              isDisabled={!isInSync}
            >
              {/* Row Margin Cell */}
              <StyledTableCell isSticky={true} sx={rowMarginStyle}>
                {rowMargin(row, rowIndex)}
              </StyledTableCell>

              {/* Data Cells with proper formatting for different data types */}
              {row.map((value, i) => {
                return (
                  <StyledTableCell
                    key={i}
                    isEven={rowIndex % 2 === 0}
                    sx={{
                      maxWidth: maxColumnWidth,
                    }}
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
                  </StyledTableCell>
                );
              })}
            </StyledAlternatingTableRow>
          ))}

          {/* Pagination Loading Indicator - Shows when loading more data */}
          {loading && data.length > 0 && hasMore && (
            <StyledAlternatingTableRow isEven={data.length % 2 === 0}>
              <TableCell colSpan={columnIds.length + 1} align="center">
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
    </MuiTableBody>
  );
};

export default TableBody;
