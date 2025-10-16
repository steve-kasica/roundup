/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import withColumnData from "./withColumnData";

const ColumnName = ({
  id,
  column,
  onClick,
  sx = {},
  selectedSx = {},
  isSelected,
}) => {
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
        userSelect: "none",
        "&:hover": onClick
          ? {
              color: "primary.main",
              textDecoration: "underline",
            }
          : {},
        ...sx,
        ...(column.isSelected && selectedSx
          ? {
              fontWeight: "bold",
            }
          : {}), // Apply selected styles if isSelected is true
      }}
    >
      {column.name || column.columnName || column.id}
    </Typography>
  );
};

ColumnName.displayName = "ColumnName";

const EnhancedColumnName = withColumnData(ColumnName);
EnhancedColumnName.displayName = "EnhancedColumnName";

export { EnhancedColumnName, ColumnName };
