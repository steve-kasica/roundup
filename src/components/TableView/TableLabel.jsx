/* eslint-disable react/prop-types */
import withTableData from "./withTableData";
import { Stack, Typography } from "@mui/material";
import { TableChart } from "@mui/icons-material";
import { formatNumber } from "../../lib/utilities/formaters";

const TableLabel = ({
  table,
  columnCount,
  onClick,
  includeDimensions = true,
  includeIcon = true,
  sx = {},
}) => {
  const rowCount = formatNumber(table?.rowCount || 0);
  return (
    <Stack
      direction={"row"}
      spacing={1}
      alignItems="center"
      onClick={onClick}
      sx={{
        ...(onClick && { cursor: "pointer" }),
        ...sx,
      }}
    >
      {includeIcon && <TableChart />}
      <Typography variant="h6" component="div" sx={{ userSelect: "none" }}>
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
