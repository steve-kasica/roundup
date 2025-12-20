import { Box, styled } from "@mui/material";

const StyledBlock = styled(Box, {
  shouldForwardProp: (prop) => !["isFocused", "hasError"].includes(prop),
})(({ theme, hasError }) => ({
  display: "flex",
  flexDirection: "row",
  position: "relative",
  boxSizing: "border-box",
  paddingTop: "20px",
  paddingLeft: "2px",
  paddingRight: "2px",
  paddingBottom: "2px",
}));

export default StyledBlock;
