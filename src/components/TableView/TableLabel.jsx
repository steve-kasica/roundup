import withTableData from "../HOC/withTableData";
import { Typography } from "@mui/material";

const TableLabel = withTableData(({ table, onClick = () => {} }) => (
  <Typography
    variant="h6"
    component="div"
    sx={{ padding: "8px 16px", cursor: "pointer", userSelect: "none" }}
    onClick={onClick}
  >
    {table.name}
  </Typography>
));

export default TableLabel;
