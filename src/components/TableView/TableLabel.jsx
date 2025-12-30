/**
 * @fileoverview TableLabel Component
 *
 * A compact label component displaying table metadata including name, icon, dimensions
 * (rows x columns), and alert badges. Used throughout the application for table
 * identification in lists, trees, and schema views.
 *
 * Features:
 * - Table name display with icon
 * - Row and column counts
 * - Alert badge with count
 * - Integration with HOCs for data
 * - Compact layout for various contexts
 *
 * @module components/TableView/TableLabel
 *
 * @example
 * <EnhancedTableLabel id={tableId} />
 */

import { withTableData, withAssociatedAlerts } from "../HOC";
import { Stack, Typography, Badge } from "@mui/material";
import { TableChart, Warning } from "@mui/icons-material";

const TableLabel = ({
  // props via withTableData
  id,
  name,
  columnCount,
  rowCount,
  // Props passed from withAssociatedAlerts via withTableData
  alertIds,
  totalCount,
  // Props passed directly from parent component
  onClick,
  includeDimensions = true,
  includeIcon = true,
  sx = {},
}) => {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableLabel for table:", id);
  }
  return (
    <Stack
      direction={"row"}
      spacing={1}
      alignItems="center"
      onClick={onClick}
      sx={{
        ...(onClick && { cursor: "pointer" }),
        ...(totalCount && {
          padding: "4px 8px",
          borderRadius: 1,
          backgroundColor: "warning.light",
          border: "1px solid",
          borderColor: "warning.main",
        }),
        ...sx,
      }}
    >
      {includeIcon && (
        <Badge
          badgeContent={totalCount ? alertIds.length : 0}
          color="warning"
          overlap="circular"
        >
          {totalCount ? <Warning color="warning" /> : <TableChart />}
        </Badge>
      )}
      <Typography
        variant="caption"
        component="div"
        sx={{
          userSelect: "none",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
          ...(totalCount && {
            color: "warning.dark",
            fontWeight: "bold",
          }),
        }}
      >
        {name}{" "}
        {includeDimensions && (
          <small>
            ({columnCount.toLocaleString()} x {rowCount.toLocaleString()})
          </small>
        )}
      </Typography>
    </Stack>
  );
};

TableLabel.displayName = "TableLabel";

const EnhancedTableLabel = withAssociatedAlerts(withTableData(TableLabel));

EnhancedTableLabel.displayName = "EnhancedTableLabel";

export { EnhancedTableLabel, TableLabel };
