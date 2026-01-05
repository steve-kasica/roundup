import { Box, styled } from "@mui/material";

const StyledBlock = styled(Box, {
  shouldForwardProp: (prop) => !["isFocused", "hasError"].includes(prop),
})(({ theme, hasError }) => ({
  display: "flex",
  flexDirection: "row",
  position: "relative",
  boxSizing: "border-box",
  paddingTop: "5px",
  paddingLeft: "5px",
  paddingRight: "5px",
  paddingBottom: "5px",
}));

export default StyledBlock;
