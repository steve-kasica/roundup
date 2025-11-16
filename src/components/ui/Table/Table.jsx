import React from "react";
import { EnhancedColumnHeader } from "../../ColumnViews";
import {
  Alert,
  CircularProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import StyledTableContainer from "./StyledTableContainer";
import StyledTable from "./StyledTable";
import StickyTableCell from "./StickyTableCell";
import StyledAlternatingTableRow from "./StyledAlternatingTableRow";
import StyledTableCell from "./StyledTableCell";
import { Box } from "lucide-react";

const Table = ({
  columnIds,
  data,
  loading,
  error,
  handleScroll,
  isMaterialized = true, // specific to operation tables
  isInSync = true, // specific to operation tables
  columnWidths = {},
  onColumnSort,
  sortConfig,
  placeHolderColumnLength = 10,
  placeHolderRowLength = 20,
}) => {
  const tableContainerRef = React.useRef(null);
  return (
    <>
      {!isMaterialized ? (
        <Alert severity="warning" sx={{ borderBottom: "1px solid #ccc" }}>
          This operation is not materialized. Please materialize to view data.
        </Alert>
      ) : !isInSync ? (
        <Alert severity="warning" sx={{ borderBottom: "1px solid #ccc" }}>
          This operation is out of sync. Please materialize to view updated
          data.
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
              <StickyTableCell
                sx={{
                  zIndex: 3,
                  backgroundColor: "#f5f5f5",
                  userSelect: "none",
                }}
              >
                #
              </StickyTableCell>

              {/* Column Headers with Sorting */}
              {columnIds.length === 0
                ? Array.from({ length: placeHolderColumnLength }).map(
                    (_, i) => (
                      <TableCell key={i} align="center" sx={{ p: "1px" }}>
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
                    )
                  )
                : columnIds.map((colId, i) => (
                    <TableCell
                      key={`${i}-${colId}`}
                      align="center"
                      sx={{ p: "1px" }}
                    >
                      <EnhancedColumnHeader
                        id={colId}
                        isActive={sortConfig.columnId === colId}
                        onSort={onColumnSort}
                        sortDirection={sortConfig.direction}
                      />
                    </TableCell>
                  ))}
            </TableRow>
          </TableHead>

          {/* Table Body - Data rows with loading, error, and pagination states */}
          <TableBody>
            {/* No columns selected*/}
            {columnIds.length === 0 ? (
              <>
                {Array.from({ length: placeHolderRowLength }).map(
                  (_, rowIndex) => (
                    <StyledAlternatingTableRow
                      key={`no-columns-${rowIndex}`}
                      isEven={rowIndex % 2 === 0}
                    >
                      <StickyTableCell
                        sx={{
                          userSelect: "none",
                        }}
                      >
                        {rowIndex + 1}
                      </StickyTableCell>
                      {Array.from({ length: placeHolderColumnLength }).map(
                        (colId, i) => (
                          <StyledTableCell
                            key={i}
                            align="center"
                            isEven={rowIndex % 2 === 0}
                            maxWidth={columnWidths[colId] || "200px"}
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
                        )
                      )}
                    </StyledAlternatingTableRow>
                  )
                )}
              </>
            ) : loading && data.length === 0 ? (
              /* Initial Loading State - Skeleton rows with loading indicators */
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <StyledAlternatingTableRow
                  key={`loading-${rowIndex}`}
                  isEven={rowIndex % 2 === 0}
                >
                  <StickyTableCell>{rowIndex + 1}</StickyTableCell>
                  {columnIds.map((colId) => (
                    <StyledTableCell
                      key={colId}
                      align="center"
                      isEven={rowIndex % 2 === 0}
                      maxWidth={columnWidths[colId] || "200px"}
                    >
                      <CircularProgress size={16} />
                    </StyledTableCell>
                  ))}
                </StyledAlternatingTableRow>
              ))
            ) : (
              /* Data Rows - Actual table content with alternating colors and hover effects */
              <>
                {data.map((row, rowIndex) => (
                  <StyledAlternatingTableRow
                    key={rowIndex}
                    isEven={rowIndex % 2 === 0}
                  >
                    {/* Row Number Cell */}
                    <StickyTableCell>{rowIndex + 1}</StickyTableCell>

                    {/* Data Cells with proper formatting for different data types */}
                    {row.map((value, i) => (
                      <StyledTableCell
                        key={i}
                        isEven={rowIndex % 2 === 0}
                        maxWidth={columnWidths[columnIds[i]] || "200px"}
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
                    ))}
                  </StyledAlternatingTableRow>
                ))}

                {/* Pagination Loading Indicator - Shows when loading more data */}
                {loading && data.length > 0 && (
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
