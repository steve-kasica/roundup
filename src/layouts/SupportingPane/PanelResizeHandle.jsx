import { PanelResizeHandle } from "react-resizable-panels";
import { styled } from "@mui/material";

const StyledPanelResizeHandle = styled(PanelResizeHandle)(() => ({
  width: "2px",
  cursor: "col-resize",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  transition: "background 0.12s ease, box-shadow 0.12s ease",
  // show blue bar on hover/active
  "&:hover, &:active": {
    background: "rgba(10, 185, 255, 1)",
    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.03)",
  },
}));

export default StyledPanelResizeHandle;
