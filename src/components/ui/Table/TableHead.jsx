/**
 * @fileoverview TableHead Component (Roundup)
 *
 * A table header component rendering column headers with sort indicators and a sticky
 * row number column. Integrates with EnhancedColumnHeader for rich column interactions.
 *
 * Features:
 * - Sticky row number header
 * - Column headers with sort support
 * - Placeholder columns when no data
 * - Integration with ColumnHeader component
 * - Sort configuration display
 *
 * @module components/ui/Table/TableHead
 *
 * @example
 * <TableHead
 *   columnIds={['col1', 'col2']}
 *   sortConfig={{ column: 'col1', direction: 'asc' }}
 *   onColumnSort={handleSort}
 * />
 */

import {
  TableHead as MuiTableHead,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import StyledTableCell from "./StyledTableCell";
import { EnhancedColumnHeader } from "./ColumnHeader.jsx";
import { PLACEHOLDER_COLUMN_COUNT } from "./index.js";

const TableHead = ({ columnIds, sortConfig, onColumnSort }) => {
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
        {columnIds.length === 0
          ? Array.from({ length: PLACEHOLDER_COLUMN_COUNT }).map((_, i) => {
              return (
                <TableCell
                  key={i}
                  align="center"
                  sx={{
                    p: "1px",
                  }}
                >
                  <Typography variant="label" color="text.secondary">
                    Column {i + 1}
                  </Typography>
                </TableCell>
              );
            })
          : columnIds.map((colId, i) => {
              return (
                <TableCell key={`${i}-${colId}`} align="left">
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
