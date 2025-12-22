/* eslint-disable react/prop-types */
import { Stack, Typography } from "@mui/material";
import StackOperationIcon from "./../ui/icons/StackOperationIcon";
import {
  withAssociatedAlerts,
  withOperationData,
  withStackOperationData,
} from "../HOC";

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
