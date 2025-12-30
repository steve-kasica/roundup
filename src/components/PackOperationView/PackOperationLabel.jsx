/**
 * @fileoverview PackOperationLabel Component
 *
 * A specialized label component for PACK (join) operations, displaying the operation name,
 * dimensions, join type, and an appropriate icon. This extends the concept of OperationLabel
 * with PACK-specific information.
 *
 * PACK operations horizontally combine (join) tables, and this label makes the join type
 * immediately visible alongside other operation metadata.
 *
 * @module components/PackOperationView/PackOperationLabel
 *
 * @example
 * <EnhancedPackOperationLabel id="pack-operation-123" />
 */

/* eslint-disable react/prop-types */
import { Stack, Typography } from "@mui/material";
import PackOperationIcon from "../ui/icons/PackOperationIcon";
import { withPackOperationData, withOperationData } from "../HOC";

/**
 * PackOperationLabel Component
 *
 * Displays PACK operation metadata including join type.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Operation identifier
 * @param {string} props.name - Operation name
 * @param {string} props.joinType - Type of join (INNER, LEFT_OUTER, etc.)
 * @param {number} props.columnCount - Number of columns in result
 * @param {number} props.rowCount - Number of rows in result
 * @param {boolean} [props.loading=false] - Loading state
 * @param {number} props.totalCount - Count of associated alerts
 * @param {boolean} [props.includeIcon=true] - Whether to show pack icon
 * @param {boolean} [props.includeDimensions=true] - Whether to show dimensions
 *
 * @returns {React.ReactElement} A label with icon, name, dimensions, and join type
 *
 * @description
 * Display format: "[Icon] Name (columns x rows) | joinType"
 * - Icon changes color to error when alerts present
 * - Name shown in error color/bold when alerts exist
 * - Join type displayed after vertical separator
 */
const PackOperationLabel = ({
  id,
  name,
  joinType,
  columnCount,
  rowCount,
  loading = false,

  // Props defined in `withAssociatedAlerts`
  totalCount,
  includeIcon = true,
  includeDimensions = true,
}) => {
  if (loading) return <span>Loading...</span>;
  if (!id) return <span>No data</span>;

  return (
    <Stack direction={"row"} spacing={1} alignItems="center">
      {includeIcon && (
        <PackOperationIcon color={totalCount > 0 ? "error" : "inherit"} />
      )}
      <Typography
        variant="h6"
        component="div"
        sx={{
          userSelect: "none",
          color: totalCount ? "error.main" : "inherit",
          fontWeight: totalCount ? 600 : "inherit",
        }}
      >
        {name || id}{" "}
        {includeDimensions && (
          <small style={{ color: totalCount ? "inherit" : undefined }}>
            ({columnCount.toLocaleString()} x{" "}
            {rowCount?.toLocaleString() || "???"})
          </small>
        )}
        {" | "}
        {joinType}
      </Typography>
    </Stack>
  );
};

PackOperationLabel.displayName = "PackOperationLabel";

const EnhancedPackOperationLabel = withOperationData(
  withPackOperationData(PackOperationLabel)
);

EnhancedPackOperationLabel.displayName = "EnhancedPackOperationLabel";

export { PackOperationLabel, EnhancedPackOperationLabel };
