import { Box, styled } from "@mui/material";

const StyledColumnsContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isDragging",
})(({ isDragging }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  gap: 1,
  flex: 1,
  transition: "all 0.2s ease-in-out",
}));

export default StyledColumnsContainer;
