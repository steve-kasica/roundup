import {
  TableHead as MuiTableHead,
  Skeleton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import StyledTableCell from "./StyledTableCell";
import { EnhancedColumnHeader } from "../../ColumnViews";

const TableHead = ({
  loading,
  columnIds,
  placeholderColumnCount,
  sortConfig,
  onColumnSort,
  rowMargin,
}) => {
  return (
    <MuiTableHead>
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
              length: columnIds?.length || placeholderColumnCount,
            }).map((_, i) => (
              <StyledTableCell key={i}>
                <Skeleton variant="text" height={24} />
              </StyledTableCell>
            ))
          : columnIds.length === 0
          ? Array.from({ length: placeholderColumnCount }).map((_, i) => {
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
            })
          : columnIds.map((colId, i) => {
              return (
                <TableCell key={`${i}-${colId}`} align="center">
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
    </MuiTableHead>
  );
};

export default TableHead;
