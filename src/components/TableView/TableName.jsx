/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import withTableData from "./withTableData";

const TableName = ({ name, sx = {} }) => {
  return (
    <Typography
      variant="h6"
      component="div"
      sx={{
        userSelect: "none",
        fontWeight: "bold",
        ...sx,
      }}
    >
      {name}
    </Typography>
  );
};

TableName.displayName = "TableName";

const EnhancedTableName = withTableData(TableName);

EnhancedTableName.displayName = "EnhancedTableName";

export { TableName, EnhancedTableName };
