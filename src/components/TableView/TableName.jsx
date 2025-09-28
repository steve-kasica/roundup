/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import withTableData from "./withTableData";

const TableName = ({ table }) => {
  return <Typography>{table?.name || "No table name available"}</Typography>;
};

const EnhancedTableName = withTableData(TableName);
export { EnhancedTableName as TableName };
