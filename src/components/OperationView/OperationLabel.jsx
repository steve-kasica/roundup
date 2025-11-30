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
  totalCount,
  includeIcon = true,
  includeDimensions = true,
}) => {
  if (loading) return <span>Loading...</span>;
  if (!id) return <span>No data</span>;

  return (
    <Stack direction={"row"} spacing={1} alignItems="center">
      {includeIcon && operationType === OPERATION_TYPE_STACK && (
        <StackOperationIcon totalCount={totalCount} />
      )}
      {includeIcon && operationType === OPERATION_TYPE_PACK && (
        <PackOperationIcon totalCount={totalCount} />
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

OperationLabel.displayName = "OperationLabel";

const EnhancedOperationLabel = withOperationData(OperationLabel);

EnhancedOperationLabel.displayName = "EnhancedOperationLabel";

export { OperationLabel, EnhancedOperationLabel };
