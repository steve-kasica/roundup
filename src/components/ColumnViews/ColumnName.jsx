/* eslint-disable react/prop-types */
import { Typography, Box } from "@mui/material";
import { withColumnData, withAssociatedAlerts } from "../HOC";

const ColumnName = ({
  // Props passed from withColumnData HOC
  id,
  name,
  databaseName,
  onClick,
  hoverColumn,
  unhoverColumn,
  isSelected,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  totalCount,
  // Props passed from parent component
  sx = {},
  selectedSx = {},
  containerSx = {},
}) => {
  const text = name || databaseName || id;
  const handleClick = (event) => {
    if (onClick) {
      onClick(event, id);
    }
  };

  return (
    <Box
      sx={{
        // display: "inline-flex",
        // alignItems: "center",
        // gap: 0.5,
        // containerType: "size",
        // minWidth: 0,
        // maxWidth: "100%",
        ...containerSx,
      }}
    >
      <Typography
        onClick={handleClick}
        onMouseEnter={hoverColumn}
        onMouseLeave={unhoverColumn}
        title={text}
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
        {text}
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

const EnhancedColumnName = withAssociatedAlerts(withColumnData(ColumnName));
EnhancedColumnName.displayName = "EnhancedColumnName";

export { EnhancedColumnName, ColumnName };
