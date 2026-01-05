import { createTheme } from "@mui/material";

const baseTheme = createTheme({
  palette: {
    textLight: "#FFFFFF",
    textDark: "#000000",
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
