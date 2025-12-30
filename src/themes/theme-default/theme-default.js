import { createTheme, lighten } from "@mui/material/styles";
import baseTheme from "./baseTheme";
// import typography, { variantMapping } from "./typography";

// colors
const loadingColor = "#fff3e0";
const selectedColor = "rgb(198, 228, 252)";
const hoverColor = lighten(selectedColor, 0.7);
const draggingColor = "#ff9800";
const dropTargetColor = "#4caf50";
const errorColor = "#f44336";
const focusedColor = "#fbc02d";

// Extend theme with column palette that references base theme
const theme = createTheme(baseTheme, {
  palette: {
    // Column-specific state colors
    column: {
      default: {
        transition: "all 0.2s ease-in-out",
      },
      hovered: {
        backgroundColor: hoverColor,
      },
      selected: {
        backgroundColor: selectedColor,
      },
      dragging: {
        backgroundColor: lighten(draggingColor, 0.85),
        transform: "scale(0.95) rotate(2deg)",
        opacity: 0.8,
        zIndex: 1000,
        outline: `2px solid ${draggingColor}`,
      },
      dropTarget: {
        outline: `2px solid ${dropTargetColor}`,
        background: lighten(dropTargetColor, 0.85),
        // borderStyle: "dashed",
        // outlineWidth: "1px",
        // outlineColor: baseTheme.palette.action.dropTargetColor,
        // outlineStyle: "dashed",
        // boxShadow: "0 2px 4px rgba(76, 175, 80, 0.3)",
      },
      overDropTarget: {
        // backgroundColor: lighten(
        //   baseTheme.palette.action.dropTargetColor,
        //   0.85
        // ),
        // outlineColor: baseTheme.palette.action.dropTargetColor,
        // outlineStyle: "dashed",
        boxShadow: "0 2px 4px rgba(76, 175, 80, 0.3)",
        transform: "scale(1.05)",
      },
      loading: {
        // background: lighten(baseTheme.palette.action.loadingColor, 0.85),
        // outlineColor: baseTheme.palette.action.loadingColor,
        animation: "pulse 1.5s ease-in-out infinite",
        "@keyframes pulse": {
          "0%": { opacity: 0.6 },
          "50%": { opacity: 1 },
          "100%": { opacity: 0.6 },
        },
      },
      error: {
        // background: lighten(baseTheme.palette.action.errorColor, 0.85),
        // outlineColor: baseTheme.palette.action.errorColor,
      },
      null: {
        // background: "#fafafa", // Very light grey
        border: "#bdbdbd", // Grey
      },
      focused: {
        // background: lighten(baseTheme.palette.action.focusedColor, 0.85),
        // outlineColor: baseTheme.palette.action.focusedColor,
        shadow: "rgba(251, 192, 45, 0.2)",
      },
      hidden: {
        // opacity: 0.3,
      },
    },
  },
  typography: {
    description: {
      fontFamily: baseTheme.typography.fontFamily,
      display: "inline-block",
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: "0.01071em",
    },
    "sub-description": {
      display: "inline-block",
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: "0.01071em",
      color: baseTheme.palette.text.secondary,
    },
    "window-title": {
      fontFamily: baseTheme.typography.fontFamily,
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    "window-subtitle": {
      fontFamily: baseTheme.typography.fontFamily,
      fontWeight: 400,
      fontSize: "1rem",
      color: baseTheme.palette.text.secondary,
    },
    "window-section-title": {
      fontFamily: baseTheme.typography.fontFamily,
      fontWeight: 500,
      fontSize: "1rem",
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          "window-title": "h2",
          "window-subtitle": "span",
          "window-section-title": "h3",
        },
      },
    },
  },
});

export default theme;
