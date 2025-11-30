/* eslint-disable react/prop-types */
import { Stack, Typography } from "@mui/material";
import PackOperationIcon from "./PackOperationIcon";
import withPackOperationData from "./withPackOperationData";

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
      {includeIcon && <PackOperationIcon totalCount={totalCount} />}
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

const EnhancedPackOperationLabel = withPackOperationData(PackOperationLabel);

EnhancedPackOperationLabel.displayName = "EnhancedPackOperationLabel";

export { PackOperationLabel, EnhancedPackOperationLabel };
