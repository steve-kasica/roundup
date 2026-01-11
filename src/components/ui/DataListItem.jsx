import { Stack } from "@mui/material";

const DataListItem = ({ spacing = 1, sx = {}, children }) => (
  <Stack
    direction="row"
    spacing={spacing}
    justifyContent={"space-between"}
    alignItems="center"
    sx={{ mb: 1, ...sx }}
  >
    {children}
  </Stack>
);
DataListItem.displayName = "DataListItem";

export default DataListItem;
