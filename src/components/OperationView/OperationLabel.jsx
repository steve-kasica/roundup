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
            ({columnCount.toLocaleString()} x {rowCount.toLocaleString()})
          </small>
        )}
      </Typography>
    </Stack>
  );
};

OperationLabel.displayName = "Operation Label";

const EnhancedOperationLabel = withAssociatedAlerts(
  withOperationData(OperationLabel)
);

EnhancedOperationLabel.displayName = "Enhanced Operation Label";

export { OperationLabel, EnhancedOperationLabel };
