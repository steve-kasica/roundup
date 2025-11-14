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
  Alert,
  IconButton,
} from "@mui/material";
import { EnhancedColumnHeader } from "../ColumnViews";
import withPackOperationData from "./withPackOperationData";
import { StickyTableCell, StyledAlternatingTableRow } from "../ui/Table";
import { EnhancedTableLabel } from "../TableView";
import { usePaginatedTableRows } from "../../hooks/useTableRowData";
import { EnhancedOperationLabel } from "../OperationView/OperationLabel";
import { EnhancedPackOperationLabel } from "./PackOperationLabel";
import { Refresh } from "@mui/icons-material";
/**
 * Virtualized table view for stack operations
 * Supports synchronized or sequential scrolling/loading of multiple tables
 * @param {*} syncTables: if false, this component implements sequential loading of table rows. If true, it concurrently loads all tables.
 * @returns
 */
const PackRows = ({
  // Props passed via withOperationData
  id,
  doesViewExist,
  activeColumnIds,
  materializeOperation,
  // Props passed from withAssociatedAlerts HOC
  hasAlerts,
  // Props passed directyl from withPackOperationData HOC
  joinPredicate,
  leftTableId,
  leftKey,
  leftSelectedColumns,
  rightTableId,
  rightKey,
  rightSelectedColumns,
  selectedMatchTypes,
}) => {
  // Memoize column arrays to prevent infinite re-renders
  const leftColumnIds = useMemo(
    () => [...leftSelectedColumns],
    [leftSelectedColumns]
  );

  const rightColumnIds = useMemo(
    () => [...rightSelectedColumns],
    [rightSelectedColumns]
  );

  // const [sortBy, setSortBy] = useState(null);
  // const [sortDirection, setSortDirection] = useState("asc");
  const results = usePaginatedTableRows(id, null);
  const { data, loading, error, hasMore, loadMore } = results;
  const tableContainerRef = useRef(null);

  const handleRefresh = useCallback(() => {
    materializeOperation();
  }, [materializeOperation]);

  return <pre>{JSON.stringify(results, null, 2)}</pre>;

  return (
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
      {!doesViewExist ? (
        <Alert
          severity="warning"
          action={
            <IconButton
              disabled={hasAlerts}
              title="Materialize operation from schema specification"
              onClick={handleRefresh}
            >
              {<Refresh />}
            </IconButton>
          }
        >
          <Typography variant="body2">
            The materialized view for this operation does not exist. Please
            compute the operation to generate the data.
          </Typography>
        </Alert>
      ) : null}

      <Table size="small" stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            {activeColumnIds.map((colId, index) => (
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

PackRows.displayName = "Pack Rows";

const EnhancedPackRows = withPackOperationData(PackRows);

EnhancedPackRows.displayName = "Enhanced Pack Rows";

export { EnhancedPackRows, PackRows };
