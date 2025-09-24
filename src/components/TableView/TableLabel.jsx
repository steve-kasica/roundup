/* eslint-disable react/prop-types */
import withTableData from "../HOC/withTableData";
import { Stack, Typography } from "@mui/material";
import { TableChart } from "@mui/icons-material";
import { formatNumber } from "../../lib/utilities/formaters";

const TableLabel = ({ table, columnCount, onClick = () => {} }) => {
  const rowCount = formatNumber(table.rowCount);
  return (
    <Stack direction={"row"} spacing={1} alignItems="center" onClick={onClick}>
      <TableChart />
      <Typography variant="h6" component="div" sx={{ userSelect: "none" }}>
        {table.name}{" "}
        <small>
          ({columnCount} x {rowCount})
        </small>
      </Typography>
    </Stack>
  );
};

TableLabel.displayName = "TableLabel";

const EnhancedTableLabel = withTableData(TableLabel);

export { EnhancedTableLabel as TableLabel };
