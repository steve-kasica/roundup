/* eslint-disable react/prop-types */
import withTableData from "./withTableData";
import { Stack, Typography, Badge } from "@mui/material";
import { TableChart, Warning } from "@mui/icons-material";

const TableLabel = ({
  table,
  columnCount,
  rowCount,
  // Props passed from withAssociatedAlerts via withTableData
  alertIds,
  hasAlerts,
  // Props passed directly from parent component
  onClick,
  includeDimensions = true,
  includeIcon = true,
  sx = {},
}) => {
  return (
    <Stack
      direction={"row"}
      spacing={1}
      alignItems="center"
      onClick={onClick}
      sx={{
        ...(onClick && { cursor: "pointer" }),
        ...(hasAlerts && {
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
          badgeContent={hasAlerts ? alertIds.length : 0}
          color="warning"
          overlap="circular"
        >
          {hasAlerts ? <Warning color="warning" /> : <TableChart />}
        </Badge>
      )}
      <Typography
        variant="h6"
        component="div"
        sx={{
          userSelect: "none",
          ...(hasAlerts && {
            color: "warning.dark",
            fontWeight: "bold",
          }),
        }}
      >
        {table?.name}{" "}
        {includeDimensions && (
          <small>
            ({columnCount} x {rowCount})
          </small>
        )}
      </Typography>
    </Stack>
  );
};

TableLabel.displayName = "TableLabel";

const EnhancedTableLabel = withTableData(TableLabel);

EnhancedTableLabel.displayName = "EnhancedTableLabel";

export { EnhancedTableLabel, TableLabel };
