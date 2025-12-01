/* eslint-disable react/prop-types */
import { Typography, Box, Tooltip } from "@mui/material";
import { Warning } from "@mui/icons-material";
import withColumnData from "./withColumnData";

const ColumnName = ({
  id,
  name,
  databaseName,
  onClick,
  sx = {},
  isSelected,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  alertIds,
  totalCount,
  // Props passed from parent component
  selectedSx = {},
}) => {
  const handleClick = (event) => {
    if (onClick) {
      onClick(event, id);
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
          ...(isSelected && selectedSx
            ? {
                fontWeight: "bold",
              }
            : {}),
          ...(totalCount && {
            color: "warning.dark",
            fontWeight: "bold",
          }),
        }}
      >
        {name || databaseName || id}
      </Typography>
      {/* Address column alerts (TODO) */}
      {/* {totalCount && (
        <Tooltip
          title={`${alertIds.length} alert${alertIds.length !== 1 ? "s" : ""}`}
        >
          <Warning color="warning" fontSize="small" sx={{ ml: 0.25 }} />
        </Tooltip>
      )} */}
    </Box>
  );
};

ColumnName.displayName = "ColumnName";

const EnhancedColumnName = withColumnData(ColumnName);
EnhancedColumnName.displayName = "EnhancedColumnName";

export { EnhancedColumnName, ColumnName };
