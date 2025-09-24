/* eslint-disable react/prop-types */
import withColumnData from "./withColumnData";
import DescriptionList from "../ui/DescriptionList";
import { Box, Stack, Typography, styled } from "@mui/material";
import { formatNumber } from "../../lib/utilities";

const StyledDataTypeTypography = styled(Typography)(() => ({
  textAlign: "right",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "50%",
}));

const StyledStatLabel = styled(Typography)(() => ({
  fontWeight: "bold",
  width: "50%",
  textTransform: "capitalize", // Capitalizes first letter of each word
}));

const ColumnSummary = ({ column, nullCount, uniqueCount, completeCount }) => {
  if (!column) {
    return <div>No column data available.</div>;
  }

  const top = column.max;
  const tableIndex = column.index + 1;

  return (
    <Box minWidth={200}>
      <h3>
        {tableIndex}. {column.name}
      </h3>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ mb: 1, justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Type
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {column.columnType}
        </StyledDataTypeTypography>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ mb: 1, justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Count
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {formatNumber(completeCount)}
        </StyledDataTypeTypography>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ mb: 1, justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Nulls
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {formatNumber(nullCount)}
        </StyledDataTypeTypography>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ mb: 1, justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Unique
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {formatNumber(uniqueCount)}
        </StyledDataTypeTypography>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ mb: 1, justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Top
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {top}
        </StyledDataTypeTypography>
      </Stack>
    </Box>
  );
};

ColumnSummary.displayName = "ColumnSummary";

const EnhancedColumnSummary = withColumnData(ColumnSummary);

export { EnhancedColumnSummary as ColumnSummary };
