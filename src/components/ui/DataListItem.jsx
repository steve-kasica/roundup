import { Stack } from "@mui/material";

const DataListItem = ({ spacing = 1, sx = {}, disabled = false, children }) => (
  <Stack
    direction="row"
    spacing={spacing}
    justifyContent={"space-between"}
    alignItems="center"
    sx={{ mb: 1, ...sx, opacity: disabled ? 0.6 : 1 }}
  >
    {children}
  </Stack>
);
DataListItem.displayName = "DataListItem";

export default DataListItem;
