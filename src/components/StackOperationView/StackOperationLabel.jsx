/* eslint-disable react/prop-types */
import { Stack, Typography } from "@mui/material";
import StackOperationIcon from "./StackOperationIcon";
import withStackOperationData from "./withStackOperationData";

const StackOperationLabel = ({
  id,
  name,
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
      {includeIcon && <StackOperationIcon hasAlerts={hasAlerts} />}
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
        {" | "}
        {"UNION"}
      </Typography>
    </Stack>
  );
};

StackOperationLabel.displayName = "StackOperationLabel";

const EnhancedStackOperationLabel = withStackOperationData(StackOperationLabel);

EnhancedStackOperationLabel.displayName = "EnhancedStackOperationLabel";

export { StackOperationLabel, EnhancedStackOperationLabel };
