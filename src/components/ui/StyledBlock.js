import { Box, styled } from "@mui/material";

const StyledBlock = styled(Box, {
  shouldForwardProp: (prop) => !["isFocused", "hasError"].includes(prop),
})(({ theme, hasError }) => ({
  display: "flex",
  flexDirection: "row",
  position: "relative",
  boxSizing: "border-box",
  overflow: "hidden",
}));

export default StyledBlock;
