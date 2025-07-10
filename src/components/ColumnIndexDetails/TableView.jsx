import { Box } from "@mui/material";
import withTableData from "../HOC/withTableData";

function TableView({ name, colWidth }) {
  return (
    <Box
      sx={{
        width: colWidth,
        padding: "4px",
        textAlign: "center",
        borderLeft: "1px solid #ccc",
        boxSizing: "border-box",
        overflow: "visible",
      }}
    >
      <Box
        sx={{
          transform: "rotate(-45deg)",
          wordWrap: "unset",
          position: "relative",
          top: "-27px",
          left: "27px",
          textAlign: "left",
        }}
      >
        {name}
      </Box>
    </Box>
  );
}

const EnhancedTableView = withTableData(TableView);
export default EnhancedTableView;
