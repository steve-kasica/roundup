/**
 * @fileoverview StackOperationLabel Component
 *
 * A specialized label component for STACK (union) operations, displaying the operation
 * name, dimensions, and operation type (UNION). This component provides visual identification
 * of STACK operations throughout the application.
 *
 * STACK operations vertically combine (union/concatenate) tables with compatible schemas,
 * and this label makes that immediately apparent with the UNION indicator.
 *
 * @module components/StackOperationView/StackOperationLabel
 *
 * @example
 * <EnhancedStackOperationLabel id="stack-operation-123" />
 */

/* eslint-disable react/prop-types */
import { Stack, Typography } from "@mui/material";
import StackOperationIcon from "./../ui/icons/StackOperationIcon";
import {
  withAssociatedAlerts,
  withOperationData,
  withStackOperationData,
} from "../HOC";

/**
 * StackOperationLabel Component
 *
 * Displays STACK operation metadata with UNION indicator.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Operation identifier
 * @param {string} props.name - Operation name
 * @param {number} props.rowCount - Number of rows in result
 * @param {number} [props.columnCount=0] - Number of columns
 * @param {boolean} [props.loading=false] - Loading state
 * @param {number} props.totalCount - Count of associated alerts
 * @param {boolean} [props.includeIcon=true] - Whether to show stack icon
 * @param {boolean} [props.includeDimensions=true] - Whether to show dimensions
 *
 * @returns {React.ReactElement} A label with icon, name, dimensions, and UNION indicator
 *
 * @description
 * Display format: "[Icon] Name (columns x rows) | UNION"
 * - Icon color changes to error when alerts present
 * - Name shown in error color/bold when alerts exist
 * - Always shows "UNION" as the operation type identifier
 */
const StackOperationLabel = ({
  id,
  name,
  rowCount,
  columnCount = 0,
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
        <StackOperationIcon color={totalCount > 0 ? "error" : "inherit"} />
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
        {"UNION"}
      </Typography>
    </Stack>
  );
};

StackOperationLabel.displayName = "StackOperationLabel";

const EnhancedStackOperationLabel = withOperationData(
  withStackOperationData(withAssociatedAlerts(StackOperationLabel))
);

EnhancedStackOperationLabel.displayName = "EnhancedStackOperationLabel";

export { StackOperationLabel, EnhancedStackOperationLabel };
