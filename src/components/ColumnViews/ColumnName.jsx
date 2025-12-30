/**
 * @fileoverview ColumnName Component
 *
 * Displays the name of a column with interactive hover effects and optional click
 * handling. The component shows visual indicators for selection state and alerts,
 * and truncates long names with ellipsis while providing a tooltip with the full name.
 *
 * This is a presentational component that can be enhanced with Redux state through
 * the withColumnData and withAssociatedAlerts HOCs.
 *
 * @module components/ColumnViews/ColumnName
 *
 * @example
 * // Using the enhanced version
 * <EnhancedColumnName id="column-123" />
 *
 * @example
 * // Using the base component with custom styling
 * <ColumnName
 *   name="customer_name"
 *   onClick={handleClick}
 *   sx={{ fontSize: '1.2rem' }}
 * />
 */

/* eslint-disable react/prop-types */
import { Typography, Box } from "@mui/material";
import { withColumnData, withAssociatedAlerts } from "../HOC";

/**
 * ColumnName Component
 *
 * Renders a column name with hover effects, click handling, and alert indicators.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Column identifier
 * @param {string} props.name - Display name of the column
 * @param {string} props.databaseName - Internal database name (fallback if name not provided)
 * @param {Function} [props.onClick] - Click handler receiving (event, id)
 * @param {Function} props.hoverColumn - Callback when mouse enters (from HOC)
 * @param {Function} props.unhoverColumn - Callback when mouse leaves (from HOC)
 * @param {boolean} props.isSelected - Whether the column is selected
 * @param {number} props.totalCount - Count of associated alerts
 * @param {Object} [props.sx={}] - MUI sx styling for the typography
 * @param {Object} [props.selectedSx={}] - Additional styling when selected
 * @param {Object} [props.containerSx={}] - Styling for the container box
 *
 * @returns {React.ReactElement} A clickable column name with hover effects
 *
 * @description
 * Visual behaviors:
 * - Shows underline on hover if onClick is provided
 * - Displays in bold if selected or has alerts
 * - Shows warning color if alerts are present
 * - Truncates with ellipsis if too long
 * - Full name shown in tooltip
 */
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
