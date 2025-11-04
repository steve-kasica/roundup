/* eslint-disable react/prop-types */
import { useRef, useCallback, useEffect, useState, useMemo } from "react";
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
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { EnhancedColumnHeader } from "../ColumnViews";
import withPackOperationData from "./withPackOperationData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";
import { EnhancedTableLabel } from "../TableView";
import useVirtualPackRows from "../../hooks/useVirtualPackRows";
/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const PackVirtualTable = ({
  operation,
  selectedOperationColumnIds,
  // Props passed from withAssociatedAlerts HOC
  hasAlerts,
  // Props passed directyl from wtihOperationData HOC
  joinPredicate,
  leftTableId,
  leftKey,
  leftSelectedColumns,
  rightTableId,
  rightKey,
  rightSelectedColumns,
}) => {
  const [matchType, setMatchType] = useState("oneToOne");

  const matchOptions = [
    { value: "oneToOne", label: "One-to-One Matches" },
    { value: "oneToMany", label: "One-to-Many Matches" },
    { value: "manyToOne", label: "Many-to-One Matches" },
    { value: "manyToMany", label: "Many-to-Many Matches" },
    { value: "oneToZero", label: "Left Unmatched (One-to-Zero)" },
    { value: "zeroToOne", label: "Right Unmatched (Zero-to-One)" },
  ];

  const handleMatchTypeChange = (event) => {
    setMatchType(event.target.value);
  };

  // Memoize column arrays to prevent infinite re-renders
  const leftColumnIds = useMemo(
    () => [...leftSelectedColumns, leftKey],
    [leftSelectedColumns, leftKey]
  );

  const rightColumnIds = useMemo(
    () => [...rightSelectedColumns, rightKey],
    [rightSelectedColumns, rightKey]
  );

  // const [sortBy, setSortBy] = useState(null);
  // const [sortDirection, setSortDirection] = useState("asc");
  const results = useVirtualPackRows(
    leftTableId,
    rightTableId,
    leftColumnIds, // column IDs
    rightColumnIds, // column IDs
    leftKey, // column id
    rightKey, // column id
    joinPredicate,
    matchType,
    50 // page size
  );
  const { data, loading, error, hasMore, loadMore } = results;
  const tableContainerRef = useRef(null);
  console.log("PackVirtualTable render", { results });
  return (
    <Box>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1 }}
        ></Typography>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel id="match-type-label">Match Type</InputLabel>
          <Select
            labelId="match-type-label"
            id="match-type-select"
            value={matchType}
            label="Match Type"
            onChange={handleMatchTypeChange}
          >
            {matchOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Toolbar>
      <TableContainer
        ref={tableContainerRef}
        sx={{
          maxHeight: "400px",
          overflowY: "auto",
          border: hasAlerts ? "2px solid" : "none",
          borderColor: hasAlerts ? "error.main" : "transparent",
          borderRadius: hasAlerts ? 1 : 0,
          backgroundColor: hasAlerts ? "error.lighter" : "transparent",
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
        <Table size="small" stickyHeader sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {[...leftColumnIds, ...rightColumnIds].map((colId, index) => (
                <TableCell key={index} align="left">
                  <EnhancedColumnHeader
                    id={colId}
                    // isActive={sortBy === colId}
                    // onSort={handleColumnSort}
                    // sortDirection={sortDirection}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              data.length === 0 &&
              Array.from({ length: 10 }).map((_, index) => (
                <StyledAlternatingTableRow key={index} isEven={index % 2 === 0}>
                  <TableCell>{index + 1}</TableCell>
                  {[...leftSelectedColumns, ...rightSelectedColumns].map(
                    (_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton variant="text" width="80%" />
                      </TableCell>
                    )
                  )}
                </StyledAlternatingTableRow>
              ))}
            {error &&
              Array.from({ length: 10 }).map((_, index) => (
                <StyledAlternatingTableRow key={index} isEven={index % 2 === 0}>
                  <TableCell>{index + 1}</TableCell>
                  {[...leftSelectedColumns, ...rightSelectedColumns].map(
                    (_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton variant="text" width="80%" />
                      </TableCell>
                    )
                  )}
                </StyledAlternatingTableRow>
              ))}
            {data &&
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
                          cell !== null && cell !== undefined
                            ? String(cell)
                            : ""
                        }
                      >
                        {cell !== null && cell !== undefined
                          ? String(cell)
                          : "—"}
                      </Typography>
                    </TableCell>
                  ))}
                </StyledAlternatingTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  // const { data, loading, error, hasMore, loadMore } = usePaginatedTableRows(
  //   operation.id,
  //   selectedOperationColumnIds,
  //   50,
  //   sortBy,
  //   sortDirection
  // );

  // // Scroll handler for lazy loading
  // const handleScroll = useCallback(() => {
  //   const container = tableContainerRef.current;
  //   if (!container || loading || !hasMore) return;

  //   const { scrollTop, scrollHeight, clientHeight } = container;
  //   // Trigger load more when scrolled to within 100px of bottom
  //   const threshold = 100;
  //   if (scrollTop + clientHeight >= scrollHeight - threshold) {
  //     loadMore();
  //   }
  // }, [loadMore, loading, hasMore]);

  // // Set up scroll listener
  // useEffect(() => {
  //   const container = tableContainerRef.current;
  //   if (!container) return;

  //   container.addEventListener("scroll", handleScroll);
  //   return () => container.removeEventListener("scroll", handleScroll);
  // }, [handleScroll]);

  // const handleColumnSort = useCallback(
  //   (event, columnId) => {
  //     let newDirection = "asc";
  //     if (sortBy === columnId) {
  //       newDirection = sortDirection === "asc" ? "desc" : "asc";
  //     }
  //     setSortBy(columnId);
  //     setSortDirection(newDirection);
  //   },
  //   [sortBy, sortDirection]
  // );

  // return (
  //
  //     {error && (
  //       <Alert severity="error">
  //         <Typography variant="body2">
  //           Failed to load table data: {error.message || "Unknown error"}
  //         </Typography>
  //       </Alert>
  //     )}
  //     <Table size="small" stickyHeader sx={{ width: "100%" }}>
  //       <TableBody>
  //         {error &&
  //           Array.from({ length: 10 }).map((_, index) => (
  //             <StyledAlternatingTableRow key={index} isEven={index % 2 === 0}>
  //               <TableCell>{index + 1}</TableCell>
  //               {selectedOperationColumnIds.map((_, colIndex) => (
  //                 <TableCell key={colIndex}>
  //                   <Skeleton variant="text" width="80%" />
  //                 </TableCell>
  //               ))}
  //             </StyledAlternatingTableRow>
  //           ))}
  //         {data &&
  //           !error &&
  //           data.map((row, rowIndex) => (
  //             <StyledAlternatingTableRow
  //               key={rowIndex}
  //               isEven={rowIndex % 2 === 0}
  //             >
  //               <StickyTableCell>{rowIndex + 1}</StickyTableCell>
  //               {row.map((cell, colIndex) => (
  //                 <TableCell key={colIndex} align="left">
  //                   <Typography
  //                     variant="body2"
  //                     sx={{
  //                       fontFamily: "monospace",
  //                       whiteSpace: "nowrap",
  //                       overflow: "hidden",
  //                       textOverflow: "ellipsis",
  //                       maxWidth: 150,
  //                     }}
  //                     title={
  //                       cell !== null && cell !== undefined ? String(cell) : ""
  //                     }
  //                   >
  //                     {cell !== null && cell !== undefined ? String(cell) : "—"}
  //                   </Typography>
  //                 </TableCell>
  //               ))}
  //             </StyledAlternatingTableRow>
  //           ))}

  //         {/* Loading indicator for pagination */}
  //         {loading && data.length > 0 && (
  //           <TableRow>
  //             <TableCell
  //               colSpan={selectedOperationColumnIds.length + 1}
  //               align="center"
  //               sx={{ py: 2 }}
  //             >
  //               <Box
  //                 display="flex"
  //                 alignItems="center"
  //                 justifyContent="center"
  //                 gap={1}
  //               >
  //                 <CircularProgress size={16} />
  //                 <Typography variant="body2" color="text.secondary">
  //                   Loading more rows...
  //                 </Typography>
  //               </Box>
  //             </TableCell>
  //           </TableRow>
  //         )}

  //         {/* End of data indicator */}
  //         {!loading && !hasMore && data.length > 0 && (
  //           <TableRow>
  //             <TableCell
  //               colSpan={selectedOperationColumnIds.length + 1}
  //               align="center"
  //               sx={{ py: 2 }}
  //             >
  //               <Typography variant="body2" color="text.secondary">
  //                 All data loaded ({data.length} rows)
  //               </Typography>
  //             </TableCell>
  //           </TableRow>
  //         )}
  //       </TableBody>
  //     </Table>
  // );
};

PackVirtualTable.displayName = "Pack Virtual Table";

const EnhancedPackVirtualTable = withPackOperationData(PackVirtualTable);

EnhancedPackVirtualTable.displayName = "Enhanced Pack Virtual Table";

export { EnhancedPackVirtualTable, PackVirtualTable };
