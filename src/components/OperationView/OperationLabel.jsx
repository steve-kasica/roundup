/* eslint-disable react/prop-types */
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { Stack, Typography } from "@mui/material";
import StackOperationIcon from "../StackOperationView/StackOperationIcon";
import PackOperationIcon from "../PackOperationView/PackOperationIcon";
import withOperationData from "../HOC/withOperationData";

const OperationLabel = ({
  id,
  name,
  operationType,
  columnCount = 0,
  rowCount = 0,
  loading = false,
  // Props defined in `withAssociatedAlerts`
  hasAlerts,
  includeIcon = true,
  includeDimensions = true,
}) => {
  if (loading) return <span>Loading...</span>;
  if (!id) return <span>No data</span>;

  return (
    <Stack direction={"row"} spacing={1} alignItems="center">
      {includeIcon && operationType === OPERATION_TYPE_STACK && (
        <StackOperationIcon hasAlerts={hasAlerts} />
      )}
      {includeIcon && operationType === OPERATION_TYPE_PACK && (
        <PackOperationIcon hasAlerts={hasAlerts} />
      )}
      <Typography
        variant="h6"
        component="div"
        sx={{
          userSelect: "none",
          color: hasAlerts ? "error.main" : "inherit",
          fontWeight: hasAlerts ? 600 : "inherit",
        }}
      >
        {name || id}{" "}
        {includeDimensions && (
          <small style={{ color: hasAlerts ? "inherit" : undefined }}>
            ({columnCount.toLocaleString()} x {rowCount.toLocaleString()})
          </small>
        )}
      </Typography>
    </Stack>
  );
};

OperationLabel.displayName = "OperationLabel";

const EnhancedOperationLabel = withOperationData(OperationLabel);

EnhancedOperationLabel.displayName = "EnhancedOperationLabel";

export { OperationLabel, EnhancedOperationLabel };
