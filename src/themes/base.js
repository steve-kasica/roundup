import { createTheme } from "@mui/material";

const baseTheme = createTheme({
  palette: {
    textLight: "#FFFFFF",
    textDark: "#000000",
    background: {
      // default: "#f5f5f5",
      default: "#eeeeee",
      paper: "#ffffff",
    },
  },
  effects: {
    defaultLighten: 0.4,
    hoveredLighten: 0.2,
    selectedLighten: 0,
    unfocusedOpacity: 0.75,
    unfocusedBlur: 1,
    focusedOpacity: 1,
    dropTargetDarken: 0.2,
    dropTargetMarchingSpeed: "10s",
    nonDropTargetOpacity: 0.5,
    nonDropTargetBlur: 1,
    isDraggingOpacity: 0.0, // Completely hide to make it look like it's being picked up
  },
  typography: {
    fontFamily: ["Inter", "sans-serif"].join(","),
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          "description term": "dt",
          "description details": "dd",
        },
      },
    },
  },
});
export default baseTheme;
