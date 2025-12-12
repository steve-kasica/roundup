import React, { useCallback } from "react";
import { EnhancedColumnHeader } from "../../ColumnViews";
import {
  Alert,
  CircularProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import StyledTableContainer from "./StyledTableContainer";
import StyledTable from "./StyledTable";
import StyledAlternatingTableRow from "./StyledAlternatingTableRow";
import StyledTableCell from "./StyledTableCell";
import MaterializeViewIconButton from "../MaterializeViewIconButton";

const maxColumnWidth = "200px";
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

const Table = ({
  columnIds,
  data,
  loading,
  error,
  // handleScroll,
  onScrollThreshold,
  onColumnSort,
  sortConfig,
  placeHolderColumnLength = 10,
  placeHolderRowLength = 20,
  errorCount,
  rowMargin = (rowData, index) => `${index + 1}`,
  hasMore = true,

  // Props specific to operation tables, and are not passed
  // when the operation is a table
  isMaterialized = true,
  isInSync = true,
  onMaterializeView = () => null,
}) => {
  const tableContainerRef = React.useRef(null);
  const handleScroll = useCallback(
    (event) => {
      // return null;
      const container = event.target;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if user has scrolled near the bottom (within 100px)
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      // if (isNearBottom && hasMore && !loading && !error) {
      //   loadMore();
      // }
      if (isNearBottom) {
        onScrollThreshold();
      }
    },
    [onScrollThreshold]
  );
  return (
    <>
      {errorCount > 0 ? (
        <Alert severity="error" sx={{ borderBottom: "1px solid #ccc" }}>
          This operation has critical schema-related errors that prevent
          materialization.
        </Alert>
      ) : loading ? (
        <Alert
          severity="info"
          sx={{ borderBottom: "1px solid #ccc" }}
          action={<CircularProgress size={16} />}
        >
          Loading table data...
        </Alert>
      ) : !isMaterialized ? (
        <Alert
          severity="warning"
          sx={{ borderBottom: "1px solid #ccc" }}
          action={<MaterializeViewIconButton onClick={onMaterializeView} />}
        >
          This operation is not materialized. Please materialize to view data.
        </Alert>
      ) : !isInSync ? (
        <Alert
          severity="warning"
          sx={{ borderBottom: "1px solid #ccc" }}
          action={<MaterializeViewIconButton onClick={onMaterializeView} />}
        >
          This operation is out of sync. Re-materialize to view updated data.
        </Alert>
      ) : columnIds.length === 0 ? (
        <Alert severity="info" sx={{ borderBottom: "1px solid #ccc" }}>
          No columns selected. Please select columns to display data.
        </Alert>
      ) : error ? (
        <Alert severity="error" sx={{ borderBottom: "1px solid #ccc" }}>
          Error loading table data: {error?.message || "Unknown error"}
        </Alert>
      ) : null}
      <StyledTableContainer ref={tableContainerRef} onScroll={handleScroll}>
        <StyledTable size="small" stickyHeader>
          {/* Table Header - Sortable column headers with hover effects */}
          <TableHead>
            <TableRow>
              {/* Sticky Row Number Header */}
              <StyledTableCell
                isSticky={true}
                sx={{
                  backgroundColor: "#f5f5f5",
                  userSelect: "none",
                  textAlign: "right",
                  zIndex: 200,
                  border: "none",
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                  minWidth: "30px",
                }}
              ></StyledTableCell>

              {/* Column Headers with Sorting */}
              {loading
                ? Array.from({
                    length: columnIds?.length || placeHolderColumnLength,
                  }).map((_, i) => (
                    <StyledTableCell key={i}>
                      <Skeleton variant="text" height={24} />
                    </StyledTableCell>
                  ))
                : columnIds.length === 0
                ? Array.from({ length: placeHolderColumnLength }).map(
                    (_, i) => {
                      return (
                        <TableCell
                          key={i}
                          align="center"
                          sx={{
                            p: "1px",
                          }}
                        >
                          <Typography
                            color="text.secondary"
                            sx={{
                              fontStyle: "italic",
                              fontWeight: 600,
                              opacity: 0.6,
                              userSelect: "none",
                            }}
                          >
                            Column {i + 1}
                          </Typography>
                        </TableCell>
                      );
                    }
                  )
                : columnIds.map((colId, i) => {
                    return (
                      <TableCell
                        key={`${i}-${colId}`}
                        align="center"
                        sx={{
                          p: "1px",
                        }}
                      >
                        <EnhancedColumnHeader
                          id={colId}
                          isActive={sortConfig.columnId === colId}
                          onSort={onColumnSort}
                          sortDirection={sortConfig.direction}
                        />
                      </TableCell>
                    );
                  })}
            </TableRow>
          </TableHead>

          {/* Table Body - Data rows with loading, error, and pagination states */}
          <TableBody>
            {/* No columns selected*/}
            {columnIds.length === 0 ? (
              <UnselectedRows columnCount={placeHolderColumnLength} />
            ) : loading && data.length === 0 ? (
              <SkeletonRows
                columnIds={columnIds}
                count={placeHolderRowLength}
              />
            ) : error ? (
              /* Error State - Show error message in table body */
              <StyledAlternatingTableRow isEven={true}>
                <TableCell colSpan={columnIds.length + 1} align="center">
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
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </>
  );
};

export default Table;

// Helper function to display skeleton rows during loading
function SkeletonRows({ columnIds, count }) {
  return (
    /* Initial Loading State - Skeleton rows with loading indicators */
    Array.from({ length: count }).map((_, rowIndex) => (
      <StyledAlternatingTableRow
        key={`loading-${rowIndex}`}
        isEven={rowIndex % 2 === 0}
      >
        <StyledTableCell isSticky={true} sx={rowMarginStyle}>
          {rowIndex + 1}
        </StyledTableCell>
        {columnIds.map((colId) => {
          return (
            <StyledTableCell
              key={colId}
              align="center"
              isEven={rowIndex % 2 === 0}
              sx={{
                maxWidth: maxColumnWidth,
              }}
            >
              <CircularProgress size={16} />
            </StyledTableCell>
          );
        })}
      </StyledAlternatingTableRow>
    ))
  );
}

function UnselectedRows({ columnCount }) {
  return (
    <>
      {Array.from({ length: columnCount }).map((_, rowIndex) => (
        <StyledAlternatingTableRow
          key={`no-columns-${rowIndex}`}
          isEven={rowIndex % 2 === 0}
        >
          <StyledTableCell isSticky={true} sx={rowMarginStyle}>
            {rowIndex + 1}
          </StyledTableCell>
          {Array.from({ length: columnCount }).map((colId, i) => {
            return (
              <StyledTableCell
                key={i}
                align="center"
                isEven={rowIndex % 2 === 0}
                sx={{
                  maxWidth: maxColumnWidth,
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    opacity: 0.3,
                    userSelect: "none",
                  }}
                >
                  No Data
                </Typography>
              </StyledTableCell>
            );
          })}
        </StyledAlternatingTableRow>
      ))}
    </>
  );
}
