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
      userSelect="none"
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "color 0.2s ease, text-decoration 0.2s ease",
        "&:hover": onClick
          ? {
              color: "primary.main",
              textDecoration: "underline",
            }
          : {},
      }}
    >
      {table?.name || "No table name available"}
    </Typography>
  );
};

const EnhancedTableName = withTableData(TableName);
export { EnhancedTableName as TableName };
