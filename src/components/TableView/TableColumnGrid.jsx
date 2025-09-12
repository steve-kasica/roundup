import { Box } from "@mui/material";
import withTableData from "../HOC/withTableData";
import { ColumnCard } from "../ColumnViews";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import ColumnValuesSample from "../ColumnViews/ColumnValuesSample";

const TableColumnGrid = withTableData(({ table, activeColumnIds }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "200px",
          overflowY: "auto",
          flexWrap: "wrap",
          justifyContent: "space-around",
          alignItems: "stretch",
          padding: 1,
          mb: 3,
          gap: 2,
        }}
      >
        {activeColumnIds.map((id, index) => (
          <Box sx={{ flex: "0 0 auto" }} key={id}>
            <ColumnCard id={id}>
              <ColumnHeader id={id} width={"auto"} />
              <ColumnValuesSample id={id} limit={5} />
            </ColumnCard>
          </Box>
        ))}
      </Box>
    </Box>
  );
});

export default TableColumnGrid;
