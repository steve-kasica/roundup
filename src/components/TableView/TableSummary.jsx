/* eslint-disable react/prop-types */

import { Typography, Box, Chip, Card } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import withTableData from "../HOC/withTableData";
import { ColumnCard } from "../ColumnViews";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import ColumnStats from "../ui/DescriptionList";
import { ColumnSummary } from "../ColumnViews/ColumnSummary";

const TableSummary = ({
  table,
  activeColumnIds,
  columnCount,
  isSelected,
  isHovered,
}) => {
  return (
    <Box
      sx={{ p: 3 }}
      display={"flex"}
      flexDirection="row"
      alignContent={"flex-start"}
      justifyContent={"space-between"}
      height={"100%"}
      gap={1}
    >
      {/* Column Cards Grid */}
      {table.columnIds.map((columnId) => (
        <Card key={columnId} sx={{ p: 1, minWidth: 200, flex: "1 1 0" }}>
          <ColumnSummary id={columnId} />
        </Card>
      ))}
    </Box>
  );
};

TableSummary.displayName = "TableSummary";

const EnhancedTableSummary = withTableData(TableSummary);

export { EnhancedTableSummary as TableSummary };
