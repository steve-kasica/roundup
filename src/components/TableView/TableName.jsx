/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import { withTableData } from "../HOC";

const TableName = ({ name, sx = {} }) => {
  return (
    <Typography
      variant="h6"
      component="div"
      sx={{
        userSelect: "none",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        fontSize: "0.75rem",
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
