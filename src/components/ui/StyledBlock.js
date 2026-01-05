import { Box, styled } from "@mui/material";
import { BLOCK_BREAKPOINTS } from "../CompositeTableSchema/settings";

const StyledBlock = styled(Box, {
  shouldForwardProp: (prop) => !["isFocused", "hasError"].includes(prop),
})(({ theme, hasError }) => ({
  display: "flex",
  flexDirection: "row",
  position: "relative",
  boxSizing: "border-box",
  padding: "0.5%",
  overflow: "hidden",
}));

export default StyledBlock;
