/* eslint-disable react/prop-types */
import { Stack, Typography } from "@mui/material";
import withStackOperationData from "./withStackOperationData";
import StackOperationIcon from "./StackOperationIcon";

const StackOperationLabel = ({
  operation,
  columnCount = 0,
  rowCount = 0,
  loading = false,
  error = false,
  includeIcon = true,
  includeDimensions = true,
}) => {
  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  if (!operation) return <span>No data</span>;

  return (
    <Stack direction={"row"} spacing={1} alignItems="center">
      {includeIcon && <StackOperationIcon />}
      <Typography variant="h6" component="div" sx={{ userSelect: "none" }}>
        {operation.name || operation.id}{" "}
        {includeDimensions && (
          <small>
            ({columnCount} x {rowCount})
          </small>
        )}
      </Typography>
    </Stack>
  );
};

StackOperationLabel.displayName = "StackOperationLabel";

const EnhancedStackOperationLabel = withStackOperationData(StackOperationLabel);

EnhancedStackOperationLabel.displayName = "EnhancedStackOperationLabel";

export { EnhancedStackOperationLabel, StackOperationLabel };
