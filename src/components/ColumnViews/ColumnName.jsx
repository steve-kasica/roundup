/* eslint-disable react/prop-types */
import { Typography, Box, Tooltip } from "@mui/material";
import { Warning } from "@mui/icons-material";
import withColumnData from "./withColumnData";

const ColumnName = ({
  id,
  column,
  onClick,
  sx = {},
  selectedSx = {},
  isSelected,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  alertIds,
  hasAlerts,
}) => {
  const handleClick = (event) => {
    if (onClick) {
      onClick(event, column?.id);
    }
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      <Typography
        onClick={handleClick}
        sx={{
          cursor: onClick ? "pointer" : "default",
          transition: "color 0.2s ease, text-decoration 0.2s ease",
          userSelect: "none",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
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
            : {}),
          ...(hasAlerts && {
            color: "warning.dark",
            fontWeight: "bold",
          }),
        }}
      >
        {column.name || column.columnName || column.id}
      </Typography>
      {hasAlerts && (
        <Tooltip
          title={`${alertIds.length} alert${alertIds.length !== 1 ? "s" : ""}`}
        >
          <Warning color="warning" fontSize="small" sx={{ ml: 0.25 }} />
        </Tooltip>
      )}
    </Box>
  );
};

ColumnName.displayName = "ColumnName";

const EnhancedColumnName = withColumnData(ColumnName);
EnhancedColumnName.displayName = "EnhancedColumnName";

export { EnhancedColumnName, ColumnName };
