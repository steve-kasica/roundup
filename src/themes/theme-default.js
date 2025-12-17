import { createTheme, lighten, alpha } from "@mui/material/styles";

// Create base theme first
const baseTheme = createTheme({
  palette: {
    action: {
      loadingColor: "#fff3e0",
      selectedColor: "#2196f3",
      hoverColor: "#9c27b0",
      draggingColor: "#ff9800",
      dropTargetColor: "#4caf50",
      errorColor: "#f44336",
      focusedColor: "#fbc02d",
    },
  },
  typography: {
    "description term": {
      color: "#555",
      fontSize: 12,
      paddingTop: "5px",
    },
    "description details": {
      fontSize: 12,
    },
    "chart title": {
      fontSize: 14,
    },
    "list headline": {
      fontSize: 14,
      paddingBottom: "2px", // spacing between primary and secondary text
      display: "block",
    },
    "list supporting text": {
      fontSize: 12,
      display: "block",
    },
    "icon text": {
      fontSize: 10,
    },
    "treemap label": {
      userSelect: "none",
      position: "absolute",
      top: 4,
      left: 4,
      zIndex: 100,
      padding: "1px 1px",
      fontSize: "0.6rem",
      lineHeight: 1,
      pointerEvents: "none",
      background: "transparent",
    },
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

// Extend theme with column palette that references base theme
export default createTheme(baseTheme, {
  palette: {
    // Column-specific state colors
    column: {
      default: {
        // outline: `1px solid ${alpha(baseTheme.palette.text.primary, 0.12)}`,
        // backgroundColor: baseTheme.palette.background.paper,
        transition: "all 0.2s ease-in-out",
      },
      hovered: {
        // backgroundColor: lighten(baseTheme.palette.action.hoverColor, 0.85), // Lightens by 85%
        // borderColor: baseTheme.palette.action.hoverColor,
        transform: "scale(1.01)",
        zIndex: 10,
      },
      selected: {
        // backgroundColor: lighten(baseTheme.palette.action.selectedColor, 0.85),
        // outlineColor: baseTheme.palette.action.selectedColor,
        transform: "scale(1.01)",
      },
      dragging: {
        backgroundColor: lighten(baseTheme.palette.action.draggingColor, 0.85),
        transform: "scale(0.95) rotate(2deg)",
        opacity: 0.8,
        zIndex: 1000,
        outline: `2px solid ${baseTheme.palette.action.draggingColor}`,
      },
      dropTarget: {
        outline: `2px solid ${baseTheme.palette.action.dropTargetColor}`,
        background: lighten(baseTheme.palette.action.dropTargetColor, 0.85),
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
    "description term": {
      color: "#555",
      fontSize: 12,
      paddingTop: "5px",
    },
    "description details": {
      fontSize: 12,
    },
    "chart title": {
      fontSize: 14,
    },
    "list headline": {
      fontSize: 14,
      paddingBottom: "2px", // spacing between primary and secondary text
      display: "block",
    },
    "list supporting text": {
      fontSize: 12,
      display: "block",
    },
    "icon text": {
      fontSize: 10,
    },
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
