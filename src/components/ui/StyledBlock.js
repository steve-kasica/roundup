import { Box, styled } from "@mui/material";

const StyledBlock = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasError",
})(({ theme, hasError }) => ({
  display: "flex",
  flexDirection: "row",
  //   border: `2px solid ${"#000"}`,
  margin: "3px",
  boxSizing: "border-box",
  //   ...(hasError && {
  //     borderColor: theme.palette.error.dark,
  //   }),
}));

export default StyledBlock;
