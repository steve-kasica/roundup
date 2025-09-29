/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import withColumnData from "./withColumnData";

const ColumnName = ({ id, column, onClick, sx = {} }) => {
  const handleClick = (event) => {
    if (onClick) {
      onClick(event, column?.id);
    }
  };

  return (
    <Typography
      onClick={handleClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "color 0.2s ease, text-decoration 0.2s ease",
        "&:hover": onClick
          ? {
              color: "primary.main",
              textDecoration: "underline",
            }
          : {},
        ...sx,
      }}
    >
      {column?.name || id}
    </Typography>
  );
};

ColumnName.displayName = "ColumnName";

const EnhancedColumnName = withColumnData(ColumnName);
EnhancedColumnName.displayName = "EnhancedColumnName";

export { EnhancedColumnName, ColumnName };
