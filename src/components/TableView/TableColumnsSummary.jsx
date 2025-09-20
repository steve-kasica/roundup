import withTableData from "../HOC/withTableData";
import { Box } from "@mui/material";
import { ColumnCard } from "../ColumnViews";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import { TableHead } from "@mui/material";

const TableColumnsSummary = withTableData(({ activeColumnIds }) => {
  return (
    <Box
      display="flex"
      flexDirection={"row"}
      justifyContent={"space-evenly"}
      gap={1}
      padding={1}
      overflow="auto"
    >
      {activeColumnIds.map((colId) => (
        <ColumnCard key={colId} id={colId}>
          <ColumnHeader id={colId} />
        </ColumnCard>
      ))}
    </Box>
  );
});

export default TableColumnsSummary;
