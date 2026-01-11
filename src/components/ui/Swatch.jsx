import { Box } from "@mui/material";

const Swatch = ({ color, radius = 0, sx = {} }) => {
  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        backgroundColor: color,
        borderRadius: radius,
        flexShrink: 0,
        ...sx,
      }}
    />
  );
};

Swatch.displayName = "Swatch";

export default Swatch;
