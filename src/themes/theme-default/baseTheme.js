import { createTheme } from "@mui/material";

const baseTheme = createTheme({
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
