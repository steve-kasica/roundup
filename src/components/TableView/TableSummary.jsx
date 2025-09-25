/* eslint-disable react/prop-types */

import { Box, Card } from "@mui/material";
import withTableData from "./withTableData";
import { ColumnSummary } from "../ColumnViews/ColumnSummary";

const TableSummary = ({ selectedColumnIds }) => {
  return (
    <Box
      p={1}
      display={"flex"}
      flexDirection="row"
      alignContent={"flex-start"}
      justifyContent={"space-between"}
      height={"100%"}
      gap={1}
    >
      {/* Column Cards Grid */}
      {selectedColumnIds.map((columnId) => (
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
