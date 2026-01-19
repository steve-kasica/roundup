import { Box, Stack, Typography } from "@mui/material";
import { withColumnData } from "../../HOC";
import { ValueChip } from "../../ui/text";

const maxWidth = 100;
const maxHeight = 50;

const ColumnMenuItemContent = ({ name, topValues }) => {
  console.log("ColumnMenuItemContent:", { name, topValues });
  return (
    <Stack sx={{ maxHeight, overflow: "hidden" }}>
      <Typography variant="data-secondary">{name}</Typography>
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
        {topValues?.slice(0, 5).map(({ value }) => (
          <ValueChip key={value} label={value} />
        ))}
      </Box>
    </Stack>
  );
};

const EnhancedColumnMenuItemContent = withColumnData(ColumnMenuItemContent);

export { EnhancedColumnMenuItemContent };
