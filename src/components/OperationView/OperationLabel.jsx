/**
 * @fileoverview OperationLabel Component
 *
 * Displays a formatted label for an operation showing its name, type icon, and dimensions.
 * The label adapts its appearance based on operation type (STACK/PACK) and alert status.
 *
 * This component is used throughout the application wherever a compact operation
 * identifier is needed (headers, lists, labels).
 *
 * @module components/OperationView/OperationLabel
 *
 * @example
 * // Using enhanced version
 * <EnhancedOperationLabel id="operation-123" />
 *
 * @example
 * // Using base component with options
 * <OperationLabel
 *   id="operation-123"
 *   name="Join Tables"
 *   operationType="PACK"
 *   columnCount={10}
 *   rowCount={1000}
 *   includeIcon={true}
 *   includeDimensions={true}
 * />
 */

/* eslint-disable react/prop-types */
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { Stack, Typography } from "@mui/material";
import StackOperationIcon from "../ui/icons/StackOperationIcon";
import PackOperationIcon from "../ui/icons/PackOperationIcon";
import withOperationData from "../HOC/withOperationData";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";
import { withPackOperationData, withStackOperationData } from "../HOC";

/**
 * OperationLabel Component
 *
 * A compact label showing operation name, icon, and dimensions.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Operation identifier
 * @param {string} props.name - Operation name
 * @param {string} props.operationType - Type (PACK/STACK/NO_OP)
 * @param {number} [props.columnCount=0] - Number of columns
 * @param {number} [props.rowCount=0] - Number of rows
 * @param {boolean} [props.loading=false] - Loading state
 * @param {number} props.totalCount - Count of associated alerts
 * @param {boolean} [props.includeIcon=true] - Whether to show type icon
 * @param {boolean} [props.includeDimensions=true] - Whether to show dimensions
 *
 * @returns {React.ReactElement} A horizontal stack with icon, name, and dimensions
 *
 * @description
 * Visual features:
 * - Icon color changes to error color when alerts are present
 * - Name displays in error color and bold when alerts exist
 * - Dimensions shown as (columns x rows) in smaller font
 * - Loading and no-data states handled gracefully
 */
const OperationLabel = ({
  // Props defined in `withOperationData` HOC
  id,
  name,
  operationType,
  columnCount = 0,
  rowCount = 0,
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
      {includeIcon && operationType === OPERATION_TYPE_STACK && (
        <StackOperationIcon color={totalCount > 0 ? "error" : "inherit"} />
      )}
      {includeIcon && operationType === OPERATION_TYPE_PACK && (
        <PackOperationIcon color={totalCount > 0 ? "error" : "inherit"} />
      )}
      <Typography
        variant="label"
        component="div"
        sx={{
          color: totalCount ? "error.main" : "inherit",
          fontWeight: totalCount ? 600 : "inherit",
        }}
      >
        {name || id}{" "}
        {includeDimensions && (
          <small style={{ color: totalCount ? "inherit" : undefined }}>
            ({columnCount.toLocaleString()} x {rowCount.toLocaleString()})
          </small>
        )}
      </Typography>
    </Stack>
  );
};

OperationLabel.displayName = "Operation Label";

const EnhancedPackOperationLabel = withPackOperationData(OperationLabel);

EnhancedPackOperationLabel.displayName = "Enhanced Pack Operation Label";

const EnhancedStackOperationLabel = withStackOperationData(OperationLabel);

EnhancedStackOperationLabel.displayName = "Enhanced Stack Operation Label";

const EnhancedOperationLabel = withAssociatedAlerts(
  withOperationData(({ id, operationType }) => {
    if (operationType === OPERATION_TYPE_PACK) {
      return <EnhancedPackOperationLabel id={id} />;
    } else if (operationType === OPERATION_TYPE_STACK) {
      return <EnhancedStackOperationLabel id={id} />;
    } else {
      throw new Error(`Unsupported operation type: ${operationType}`);
    }
  }),
);

EnhancedOperationLabel.displayName = "Enhanced Operation Label";

export { OperationLabel, EnhancedOperationLabel };
