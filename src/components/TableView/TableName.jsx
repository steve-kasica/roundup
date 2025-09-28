/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import withTableData from "./withTableData";

const TableName = ({ table, onClick }) => {
  return (
    <Typography
      onClick={onClick}
      fontSize={10}
      fontFamily={"monospace"}
      color="#777"
    >
      {table?.name || "No table name available"}
    </Typography>
  );
};

const EnhancedTableName = withTableData(TableName);
export { EnhancedTableName as TableName };
