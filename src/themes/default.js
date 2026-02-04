import { createTheme } from "@mui/material/styles";
import baseTheme from "./base";
// import typography, { variantMapping } from "./typography";

// colors
const selectedColor = "rgb(198, 228, 252)";

// Extend theme with column palette that references base theme
const theme = createTheme(baseTheme, {
  palette: {
    operationColors: [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      // "#7f7f7f",
      "#bcbd22",
      "#17becf",
    ],
    orphanedTableBackgroundColor: "#7f7f7f",
  },
  typography: {
    // ============================================
    // TYPOGRAPHY HIERARCHY FOR VISUAL ANALYTICS
    // ============================================

    // LEVEL 1: Page/Dashboard Titles (largest, most prominent)
    // Usage: Main dashboard titles, primary page headings
    title: {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "2rem", // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: baseTheme.palette.text.primary,
    },

    // LEVEL 2: Section Headers
    // Usage: Major section dividers, panel titles, workflow titles
    "section-title": {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      color: baseTheme.palette.text.primary,
      userSelect: "none",
    },

    // LEVEL 3: Subsection Headers
    // Usage: Component headers, table titles, chart titles
    "subsection-title": {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "1.125rem", // 18px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0em",
      color: baseTheme.palette.text.primary,
      userSelect: "none",
    },

    // LEVEL 4: Component Labels
    // Usage: Operation labels, metric labels, axis titles
    label: {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "0.875rem", // 14px
      fontWeight: 600,
      lineHeight: 1.43,
      letterSpacing: "0.01em",
      textTransform: "uppercase",
      color: baseTheme.palette.text.secondary,
    },

    // LEVEL 5: Primary Data Text
    // Usage: Data table cells, metric values, primary content
    "data-primary": {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "1rem", // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0em",
      userSelect: "none",
    },

    // LEVEL 6: Secondary Data Text
    // Usage: Supporting data, metadata, timestamps
    "data-secondary": {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: "0.01em",
      userSelect: "none",
    },

    // LEVEL 7: Tertiary/Small Data
    // Usage: Small annotations, hints, footnotes, badges
    "data-small": {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "0.75rem", // 12px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0.02em",
      userSelect: "none",
    },

    // LEVEL 8: Micro Text
    // Usage: Very small labels, counts in compact spaces
    "data-micro": {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "0.625rem", // 10px
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: "0.03em",
      userSelect: "none",
    },

    // SPECIAL: Emphasized Metrics
    // Usage: Key performance indicators, highlighted values
    "metric-large": {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "2.5rem", // 40px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },

    "metric-medium": {
      fontFamily: baseTheme.typography.fontFamily,
      fontSize: "1.75rem", // 28px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      color: baseTheme.palette.text.primary,
    },

    // SPECIAL: Monospace for Code/Technical Data
    // Usage: SQL queries, technical IDs, code snippets
    code: {
      fontFamily: ["Consolas", "Monaco", "Courier New", "monospace"].join(","),
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0em",
      color: baseTheme.palette.text.primary,
    },

    "code-small": {
      fontFamily: ["Consolas", "Monaco", "Courier New", "monospace"].join(","),
      fontSize: "0.75rem", // 12px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0em",
      color: baseTheme.palette.text.secondary,
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          // Analytics hierarchy mappings
          title: "h1",
          "section-title": "h2",
          "subsection-title": "h3",
          label: "span",
          "data-primary": "div",
          "data-secondary": "span",
          "data-small": "span",
          "data-micro": "span",
          "metric-large": "div",
          "metric-medium": "div",
          code: "code",
          "code-small": "code",
        },
      },
    },
  },
});

export default theme;
