/* eslint-disable react/prop-types */
import {
  Box,
  TableBody,
  TableCell,
  TableContainer,
  CircularProgress,
  Typography,
  Alert,
  Skeleton,
  Fade,
  LinearProgress,
  Table,
  TableHead,
} from "@mui/material";
import withStackOperationData from "./withStackOperationData";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";

/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
export const StackVirtualizedTable = withStackOperationData(({ operation }) => {
  const columnIds = null;
  const { data, loading, error } = usePaginatedTableRows(
    operation.id,
    columnIds,
    50
  );
  //   // Ref for the table container to detect scroll
  //   const tableContainerRef = useRef(null);
  //   const {
  //     data,
  //     loading,
  //     error,
  //     hasMore,
  //     currentPage,
  //     loadMore,
  //     refresh,
  //     reset,
  //   } = usePaginatedTableRows(operation.id, selectedColumnIds, 50);
  //   const [isLoadingMore, setIsLoadingMore] = useState(false);
  //   // Handle scroll to detect when to load more data
  //   const handleScroll = useCallback(
  //     (event) => {
  //       const container = event.target;
  //       const { scrollTop, scrollHeight, clientHeight } = container;
  //       const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
  //       // Load more when user scrolls to 80% of the content
  //       if (isNearBottom && hasMore && !loading && !error) {
  //         loadMore();
  //       }
  //     },
  //     [loadMore, loading, hasMore, error]
  //   );
  //   // Error state
  //   if (error) {
  //     return (
  //       <Box p={2}>
  //         <Alert
  //           severity="error"
  //           action={
  //             <Box>
  //               <Typography
  //                 variant="body2"
  //                 component="span"
  //                 sx={{ cursor: "pointer", textDecoration: "underline" }}
  //                 onClick={refresh}
  //               >
  //                 Retry
  //               </Typography>
  //             </Box>
  //           }
  //         >
  //           <Typography variant="body2">
  //             Failed to load table data: {error.message || "Unknown error"}
  //           </Typography>
  //         </Alert>
  //       </Box>
  //     );
  //   }
  //   // Loading state
  //   if (loading) {
  //     return (
  //       <Box p={2}>
  //         <Box display="flex" alignItems="center" gap={2} mb={2}>
  //           <CircularProgress size={20} />
  //           <Typography variant="body2" color="text.secondary">
  //             Loading table data...
  //           </Typography>
  //         </Box>
  //         {/* Skeleton loader for table rows */}
  //         <TableContainer>
  //           <TableBody>
  //             {Array.from({ length: 5 }).map((_, index) => (
  //               <StyledAlternatingTableRow key={index} isEven={index % 2 === 0}>
  //                 {Array.from({ length: 4 }).map((_, colIndex) => (
  //                   <TableCell key={colIndex}>
  //                     <Skeleton variant="text" width="80%" />
  //                   </TableCell>
  //                 ))}
  //               </StyledAlternatingTableRow>
  //             ))}
  //           </TableBody>
  //         </TableContainer>
  //       </Box>
  //     );
  //   }
  //   // Empty state
  //   if (!data || data.length === 0) {
  //     return (
  //       <Box p={2}>
  //         <Typography variant="body2" color="text.secondary" align="center">
  //           No data available for this operation
  //         </Typography>
  //       </Box>
  //     );
  //   }
  // Success state - render the actual data
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
      <Table size="small" stickyHeader sx={{ width: "auto" }}>
        <TableBody>
          {data.map((row, rowIndex) => (
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
});
