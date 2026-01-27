import { Box, Stack, Typography } from "@mui/material";
import { withColumnData } from "../../../../HOC";
import { ValueChip } from "../../../../ui/text";
import { ColumnTypeIcon } from "../../../../ColumnViews";

const maxWidth = 100;
const maxHeight = 50;

const ColumnMenuItemContent = ({ name, topValues, sx, columnType }) => {
  return (
    <Stack sx={{ maxHeight, overflow: "hidden", ...sx }}>
      <Stack
        direction={"row"}
        sx={{ gap: 1, alignItems: "center", maxWidth, overflow: "hidden" }}
      >
        <Typography variant="data-secondary">{name}</Typography>
        <ColumnTypeIcon columnType={columnType} />
      </Stack>
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap", mt: 0.5 }}>
        {topValues?.slice(0, 5).map(({ value }) => (
          <ValueChip key={value} label={value} />
        ))}
      </Box>
    </Stack>
  );
};

const EnhancedColumnMenuItemContent = withColumnData(ColumnMenuItemContent);

export { EnhancedColumnMenuItemContent };
